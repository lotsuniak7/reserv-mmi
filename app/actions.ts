"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from 'resend';

// Initialisation du client Email (Resend)
const resend = new Resend(process.env.RESEND_API_KEY);

// Type pour les articles venant du panier
type CartItemPayload = {
    id: number;
    quantity: number;
    startDate: string;
    endDate: string;
};

/* ==========================================================================
   1. GESTION DES RÉSERVATIONS (Côté Étudiant)
   ========================================================================== */

/**
 * Soumettre une demande de réservation (Panier).
 * Crée un dossier "Request" et y attache les lignes "Reservations".
 * Vérifie les stocks et les dates avant insertion.
 */
export async function submitCartReservation(items: CartItemPayload[], globalMessage: string) {
    const supabase = await createClient();

    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Vous devez être connecté." };

    if (items.length === 0) return { error: "Le panier est vide." };

    // 2. Configuration des dates limites
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    // 3. Vérifications (Dates & Stocks) pour chaque article
    for (const item of items) {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);

        if (start < today) return { error: `Date passée pour l'article #${item.id}.` };
        if (end < start) return { error: `La date de fin est avant le début pour l'article #${item.id}.` };
        if (end > maxDate) return { error: `Réservation limitée à 1 an pour l'article #${item.id}.` };

        // Récupération infos instrument
        const { data: instrument } = await supabase
            .from("instruments")
            .select("quantite, name")
            .eq("id", item.id)
            .single();

        if (!instrument) continue;

        // Calcul du stock déjà réservé sur cette période
        const { data: reservations } = await supabase
            .from("reservations")
            .select("quantity")
            .eq("instrument_id", item.id)
            .neq("statut", "refusée")
            .neq("statut", "terminée") // On ignore les terminées si elles rendent le stock (à adapter selon ta logique)
            .lte("date_debut", item.endDate) // Chevauchement de dates
            .gte("date_fin", item.startDate);

        const reservedCount = reservations?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0;
        const available = (instrument.quantite || 1) - reservedCount;

        if (item.quantity > available) {
            return { error: `Stock insuffisant pour "${instrument.name}". Disponible : ${available}.` };
        }
    }

    // 4. Création du dossier (Request)
    const { data: request, error: reqError } = await supabase
        .from("requests")
        .insert({
            user_id: user.id,
            message: globalMessage,
            status: "en attente"
        })
        .select()
        .single();

    if (reqError || !request) {
        return { error: "Erreur lors de la création du dossier : " + (reqError?.message || "Inconnue") };
    }

    // 5. Préparation des lignes de réservation
    const reservationsToInsert = items.map(item => ({
        user_id: user.id,
        instrument_id: item.id,
        date_debut: item.startDate,
        date_fin: item.endDate,
        quantity: item.quantity,
        statut: "en attente",
        request_id: request.id
    }));

    // 6. Insertion des lignes
    const { error: linesError } = await supabase.from("reservations").insert(reservationsToInsert);

    if (linesError) return { error: linesError.message };

    // 7. Rafraîchissement des caches
    revalidatePath("/mes-reservations");
    revalidatePath("/admin");

    return { success: true };
}

/**
 * Annuler une réservation (Côté Étudiant).
 * Supprime la ligne si elle est encore "en attente".
 */
export async function cancelReservation(reservationId: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté");

    // Suppression (RLS doit bloquer si ce n'est pas "en attente" ou si ce n'est pas le bon user)
    const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationId);

    if (error) {
        console.error("Erreur suppression:", error.message);
        throw new Error(error.message);
    }

    revalidatePath("/mes-reservations");
    revalidatePath("/admin");
}

/* ==========================================================================
   2. GESTION ADMINISTRATIVE (Réservations)
   ========================================================================== */

/**
 * Mettre à jour le statut d'une réservation (Admin).
 * Gère la validation ou le refus avec motif.
 */
export async function updateReservationStatus(
    reservationId: number,
    newStatus: 'validée' | 'refusée',
    reason?: string
) {
    const supabase = await createClient();

    // Vérification Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') {
        return { error: "Accès refusé. Réservé aux administrateurs." };
    }

    const updateData: any = { statut: newStatus };

    // Si refus, on ajoute le motif
    if (newStatus === 'refusée' && reason) {
        updateData.message = reason;
    }

    const { error } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("id", reservationId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/mes-reservations");
    return { success: true };
}

/* ==========================================================================
   3. GESTION DE L'INVENTAIRE (Admin)
   ========================================================================== */

/**
 * Créer un nouveau matériel.
 * Gère l'upload de l'image vers Supabase Storage.
 */
export async function createInstrument(formData: FormData) {
    const supabase = await createClient();

    // Vérification Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const name = formData.get("name") as string;
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;

    if (!name) return { error: "Le nom du matériel est obligatoire." };

    let finalImageUrl = "";

    // Upload de l'image
    if (imageFile && imageFile.size > 0) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`; // Nettoyage du nom

        const { error: uploadError } = await supabase
            .storage
            .from('instruments')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            return { error: "Erreur upload image : " + uploadError.message };
        }

        // Génération de l'URL publique
        const { data: publicUrlData } = supabase
            .storage
            .from('instruments')
            .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
    }

    // Insertion en base
    const { error } = await supabase.from("instruments").insert({
        name,
        categorie,
        image_url: finalImageUrl,
        description,
        status: "dispo",
        quantite: 1
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/"); // Met à jour le catalogue
    return { success: true };
}

/**
 * Supprimer un matériel.
 */
export async function deleteInstrument(id: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const { error } = await supabase.from("instruments").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/");
    return { success: true };
}

/**
 * Récupérer les réservations futures d'un instrument (Helper pour le calendrier).
 */
export async function getInstrumentReservations(id: number) {
    const supabase = await createClient();

    const { data } = await supabase
        .from("reservations")
        .select("date_debut, date_fin, quantity")
        .eq("instrument_id", id)
        .neq("statut", "refusée")
        .neq("statut", "terminée");

    return data || [];
}

/* ==========================================================================
   4. GESTION DES UTILISATEURS (Admin)
   ========================================================================== */

/**
 * Approuver un utilisateur (Accès autorisé).
 * Envoie un email de bienvenue via Resend.
 */
export async function approveUser(targetUserId: string, targetEmail: string) {
    const supabase = await createClient();

    // Vérification Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Non autorisé" };

    // Validation en base
    const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    // Envoi de l'email
    try {
        await resend.emails.send({
            from: 'MMI Dijon <onboarding@resend.dev>', // Pense à vérifier ton domaine Resend
            to: targetEmail,
            subject: '✅ Votre compte a été validé !',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>Bienvenue sur MMI Réservation !</h1>
                    <p>Bonne nouvelle, votre compte a été validé par un administrateur.</p>
                    <p>Vous pouvez dès maintenant vous connecter et réserver du matériel.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="display:inline-block; background:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Se connecter</a>
                </div>
            `
        });
    } catch (e) {
        console.error("Erreur d'envoi d'email:", e);
    }

    revalidatePath("/admin/users");
    return { success: true };
}

/**
 * Rejeter un utilisateur (Suppression du profil).
 * Envoie un email de refus.
 */
export async function rejectUser(targetUserId: string, targetEmail: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Non autorisé" };

    // Envoi de l'email
    try {
        await resend.emails.send({
            from: 'MMI Dijon <onboarding@resend.dev>',
            to: targetEmail,
            subject: '❌ Inscription refusée',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>Inscription refusée</h1>
                    <p>Bonjour,</p>
                    <p>Votre demande d'accès au magasin MMI n'a pas été retenue.</p>
                    <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter un responsable.</p>
                </div>
            `
        });
    } catch (e) {
        console.error("Erreur d'envoi d'email:", e);
    }

    // Suppression du profil
    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

/* ==========================================================================
   5. AUTHENTIFICATION
   ========================================================================== */

/**
 * Déconnexion (Sign Out).
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
}