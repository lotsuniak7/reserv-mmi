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

// Type pour les informations complémentaires du Bon de Sortie
type BookingDetails = {
    phone: string;
    filiere: string;
    parcours: string;
    projectType: 'pédagogique' | 'personnel';
    enseignant: string;
};

/* ==========================================================================
   HELPER : RÉCUPÉRATION PROFIL
   ========================================================================== */

/**
 * Récupère les infos du profil connecté pour pré-remplir le formulaire.
 */
export async function getMyProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, filiere, parcours")
        .eq("id", user.id)
        .single();

    return data;
}

/* ==========================================================================
   1. GESTION DES RÉSERVATIONS (Côté Étudiant)
   ========================================================================== */

/**
 * Soumettre une demande de réservation (Panier).
 * Met à jour le profil utilisateur (mémoire) et crée le dossier Request.
 */
export async function submitCartReservation(
    items: CartItemPayload[],
    globalMessage: string,
    details: BookingDetails
) {
    const supabase = await createClient();

    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Vous devez être connecté." };

    if (items.length === 0) return { error: "Le panier est vide." };

    // --- MISE À JOUR DU PROFIL (MÉMOIRE) ---
    // On sauvegarde le téléphone, la filière et le parcours pour la prochaine fois
    await supabase
        .from("profiles")
        .update({
            phone: details.phone,
            filiere: details.filiere,
            parcours: details.parcours
        })
        .eq("id", user.id);

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
            .neq("statut", "terminée")
            .lte("date_debut", item.endDate)
            .gte("date_fin", item.startDate);

        const reservedCount = reservations?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0;
        const available = (instrument.quantite || 1) - reservedCount;

        if (item.quantity > available) {
            return { error: `Stock insuffisant pour "${instrument.name}". Disponible : ${available}.` };
        }
    }

    // 4. Création du dossier (Request) avec les nouvelles infos
    const { data: request, error: reqError } = await supabase
        .from("requests")
        .insert({
            user_id: user.id,
            message: globalMessage,
            statut: "en attente",
            enseignant: details.enseignant,       // <--- AJOUT
            project_type: details.projectType     // <--- AJOUT
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
    revalidatePath("/catalogue");
    revalidatePath("/");

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
    revalidatePath("/catalogue");
    revalidatePath("/");
}

/* ==========================================================================
   2. GESTION ADMINISTRATIVE (Réservations)
   ========================================================================== */

/**
 * Mettre à jour le statut global d'un dossier (Request).
 */
export async function updateRequestStatus(
    requestId: number,
    newStatus: 'validée' | 'refusée',
    reason?: string
) {
    const supabase = await createClient();

    // 1. Vérification Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') {
        return { error: "Accès refusé." };
    }

    // 2. Mise à jour du dossier parent (requests)
    // ATTENTION : On suppose que la colonne s'appelle 'status' dans la table 'requests'
    const { error: requestError } = await supabase
        .from("requests")
        .update({ statut: newStatus })
        .eq("id", requestId);

    if (requestError) {
        console.error("Erreur update request:", requestError);
        return { error: "Erreur DB Request: " + requestError.message };
    }

    // 3. Mise à jour en cascade des lignes (reservations)
    // ATTENTION : On suppose que la colonne s'appelle 'statut' (avec un T à la fin) dans 'reservations'
    const updateData: any = { statut: newStatus };
    if (newStatus === 'refusée' && reason) {
        updateData.message = reason;
    }

    const { error: linesError } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("request_id", requestId);

    if (linesError) {
        console.error("Erreur update reservations:", linesError);
        return { error: "Erreur DB Reservations: " + linesError.message };
    }

    // 4. Force le rafraîchissement de toutes les pages concernées
    revalidatePath("/admin", "page");
    revalidatePath("/mes-reservations", "page");

    return { success: true };
}

/* ==========================================================================
   3. GESTION DE L'INVENTAIRE (Admin & Helpers)
   ========================================================================== */

/**
 * Créer un nouveau matériel avec quantité.
 */
export async function createInstrument(formData: FormData) {
    const supabase = await createClient();

    // Vérification Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const name = formData.get("name") as string;
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const quantite = parseInt(formData.get("quantite") as string) || 1; // Récupère la quantité
    const imageFile = formData.get("image") as File;

    if (!name) return { error: "Le nom du matériel est obligatoire." };

    let finalImageUrl = "";

    // Upload de l'image (Correction du bug d'image)
    if (imageFile && imageFile.size > 0) {
        // Nom unique pour éviter les conflits
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase
            .storage
            .from('instruments')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) return { error: "Erreur upload image : " + uploadError.message };

        // Génération correcte de l'URL publique
        const { data: publicUrlData } = supabase
            .storage
            .from('instruments')
            .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
    }

    // Insertion
    const { error } = await supabase.from("instruments").insert({
        name,
        categorie,
        image_url: finalImageUrl, // Peut être vide si pas d'image
        description,
        status: "dispo",
        quantite: quantite // On sauvegarde la quantité choisie
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/");
    revalidatePath("/catalogue");
    return { success: true };
}

/**
 * Mettre à jour un instrument existant (Modification).
 */
export async function updateInstrument(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const quantite = parseInt(formData.get("quantite") as string);
    const imageFile = formData.get("image") as File;

    const updateData: any = {
        name,
        categorie,
        description,
        quantite
    };

    // Si une nouvelle image est uploadée, on la remplace
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase
            .storage
            .from('instruments')
            .upload(fileName, imageFile);

        if (!uploadError) {
            const { data } = supabase.storage.from('instruments').getPublicUrl(fileName);
            updateData.image_url = data.publicUrl;
        }
    }

    const { error } = await supabase
        .from("instruments")
        .update(updateData)
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/catalogue");
    return { success: true };
}

/**
 * Supprimer un matériel et son image associée.
 */
export async function deleteInstrument(id: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    // 1. D'abord, on récupère l'URL de l'image pour pouvoir la supprimer
    const { data: instrument } = await supabase
        .from("instruments")
        .select("image_url")
        .eq("id", id)
        .single();

    // 2. Si une image existe, on la supprime du Stockage Supabase
    if (instrument?.image_url) {
        // L'URL ressemble à : .../storage/v1/object/public/instruments/nom-du-fichier.jpg
        // On doit extraire juste le nom du fichier à la fin.
        const fileName = instrument.image_url.split('/').pop();

        if (fileName) {
            const { error: storageError } = await supabase
                .storage
                .from('instruments')
                .remove([fileName]);

            if (storageError) {
                console.error("Erreur suppression image:", storageError);
                // On continue quand même pour supprimer la ligne en base
            }
        }
    }

    // 3. Suppression de la ligne en base de données
    const { error } = await supabase.from("instruments").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/");
    return { success: true };
}

/**
 * Récupérer les réservations futures d'un instrument.
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

export async function approveUser(targetUserId: string, targetEmail: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Non autorisé" };

    const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    try {
        await resend.emails.send({
            from: 'MMI Dijon <onboarding@resend.dev>',
            to: targetEmail,
            subject: '✅ Votre compte a été validé !',
            html: `<h1>Bienvenue !</h1><p>Votre compte a été validé.</p>`
        });
    } catch (e) {
        console.error("Erreur email:", e);
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function rejectUser(targetUserId: string, targetEmail: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Non autorisé" };

    if (user.id === targetUserId) {
        return { error: "Vous ne pouvez pas supprimer votre propre compte administrateur." };
    }

    try {
        await resend.emails.send({
            from: 'MMI Dijon <onboarding@resend.dev>',
            to: targetEmail,
            subject: '❌ Inscription refusée',
            html: `<h1>Inscription refusée</h1><p>Contactez un responsable.</p>`
        });
    } catch (e) {
        console.error("Erreur email:", e);
    }

    const { error } = await supabase.from("profiles").delete().eq("id", targetUserId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

/* ==========================================================================
   5. AUTHENTIFICATION
   ========================================================================== */

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
}

/* ==========================================================================
   6. GESTION DU PROFIL (User)
   ========================================================================== */

/**
 * Met à jour les informations du profil utilisateur.
 */
export async function updateUserProfile(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non connecté" };

    const phone = formData.get("phone") as string;
    const filiere = formData.get("filiere") as string;
    const parcours = formData.get("parcours") as string;

    const { error } = await supabase
        .from("profiles")
        .update({
            phone,
            filiere,
            parcours,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profil");
    revalidatePath("/panier"); // Le panier utilise ces infos
    return { success: true };
}