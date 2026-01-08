// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from 'resend';

// Тип товара из корзины
type CartItemPayload = {
    id: number;
    quantity: number;
    startDate: string;
    endDate: string;
};

// 1. Создание ЗАЯВКИ (Папки) с товарами
export async function submitCartReservation(items: CartItemPayload[], globalMessage: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    if (items.length === 0) return { error: "Le panier est vide." };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    // --- ПРОВЕРКА ДАТ И КОЛИЧЕСТВА ---
    for (const item of items) {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);

        if (start < today) return { error: `Date passée pour l'article #${item.id}.` };
        if (end < start) return { error: `Date fin avant début pour l'article #${item.id}.` };
        if (end > maxDate) return { error: `Réservation > 1 an pour l'article #${item.id}.` };

        const { data: instrument } = await supabase
            .from("instruments")
            .select("quantite, name")
            .eq("id", item.id)
            .single();

        if (!instrument) continue;

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

    // А. Сначала создаем "Папку" (Request)
    const { data: request, error: reqError } = await supabase
        .from("requests")
        .insert({
            user_id: user.id,
            message: globalMessage,
            status: "en attente"
        })
        .select()
        .single();

    // ИСПРАВЛЕНИЕ ОШИБКИ ЗДЕСЬ:
    // Мы безопасно проверяем, есть ли ошибка. Если reqError null, используем запасной текст.
    if (reqError || !request) {
        return { error: "Erreur création dossier: " + (reqError?.message || "Erreur inconnue") };
    }

    // Б. Готовим товары
    const reservationsToInsert = items.map(item => ({
        user_id: user.id,
        instrument_id: item.id,
        date_debut: item.startDate,
        date_fin: item.endDate,
        quantity: item.quantity,
        statut: "en attente",
        request_id: request.id
    }));

    // В. Сохраняем товары
    const { error: linesError } = await supabase.from("reservations").insert(reservationsToInsert);

    if (linesError) return { error: linesError.message };

    revalidatePath("/mes-reservations");
    revalidatePath("/admin");

    return { success: true };
}

// 2. Обновление статуса ОДНОЙ СТРОКИ (Для админа: галочка или крестик)
export async function updateLineStatus(reservationId: number, newStatus: 'validée' | 'refusée', reason?: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const updateData: any = { statut: newStatus };

    // Если отказ, записываем причину прямо в строку бронирования
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

// 2. Отмена бронирования
export async function cancelReservation(reservationId: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // Удаляем только если это бронь текущего пользователя
    const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationId)
        .eq("user_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/mes-reservations");
    return { success: true };
}

// 3. Обновление статуса (Только для админов) + Причина отказа
export async function updateReservationStatus(
    reservationId: number,
    newStatus: 'validée' | 'refusée',
    reason?: string
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') {
        return { error: "Accès refusé." };
    }

    // Формируем объект для обновления
    const updateData: any = { statut: newStatus };

    // Если это отказ и есть причина, обновляем поле message
    // (Мы добавляем префикс "Refusé :", чтобы пользователю было понятно)
    if (newStatus === 'refusée' && reason) {
        updateData.message = `Refus : ${reason}`;
    }

    const { error } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("id", reservationId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/mes-reservations");
    return { success: true };
}

// ... существующий код ...

// --- ИНВЕНТАРЬ (Только Админ) ---

// 4. Удаление товара
export async function deleteInstrument(id: number) {
    const supabase = await createClient();

    // Проверка прав
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const { error } = await supabase.from("instruments").delete().eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/inventaire");
    revalidatePath("/"); // Обновить каталог
    return { success: true };
}

// 5. Создание товара
export async function createInstrument(formData: FormData) {
    const supabase = await createClient();

    // 1. Vérification Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const name = formData.get("name") as string;
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;

    // 2. Récupération du fichier image
    const imageFile = formData.get("image") as File;
    let finalImageUrl = "";

    if (!name) return { error: "Le nom du matériel est obligatoire." };

    // 3. Logique d'upload de l'image (si un fichier est fourni)
    if (imageFile && imageFile.size > 0) {
        // Créer un nom de fichier unique pour éviter les conflits (ex: 123456789-camera.jpg)
        const fileName = `${Date.now()}-${imageFile.name}`;

        // Upload vers le bucket "instruments"
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('instruments')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            return { error: "Erreur upload image : " + uploadError.message };
        }

        // Récupérer l'URL publique pour la base de données
        const { data: publicUrlData } = supabase
            .storage
            .from('instruments')
            .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
    }

    // 4. Insertion en base de données avec l'URL de l'image
    const { error } = await supabase.from("instruments").insert({
        name,
        categorie,
        image_url: finalImageUrl, // On enregistre le lien généré
        description,
        status: "dispo",
        quantite: 1
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/");
    return { success: true };
}

// 6. Получить бронирования для конкретного товара (для модального окна)
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

const resend = new Resend(process.env.RESEND_API_KEY);

// НОВАЯ ФУНКЦИЯ: Одобрить пользователя
export async function approveUser(targetUserId: string, targetEmail: string) {
    const supabase = await createClient();

    // 1. Проверка: Я админ?
    const { data: { user } } = await supabase.auth.getUser();
    // (Лучше проверять роль через профиль, но пока оставим как есть или через метаданные)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
    // if (profile?.role !== 'admin') return { error: "Non autorisé" };

    // 2. Обновляем статус в базе
    const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    // 3. Отправляем письмо через Resend
    try {
        await resend.emails.send({
            from: 'MMI Dijon <onboarding@resend.dev>', // Или твой домен
            to: targetEmail,
            subject: '✅ Votre compte a été validé !',
            html: `
                <h1>Bienvenue au notre service de reservation MMI !</h1>
                <p>Bonne nouvelle, votre compte a été validé par un administrateur.</p>
                <p>Vous pouvez maintenant vous connecter et réserver du matériel.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login">Se connecter</a>
            `
        });
    } catch (e) {
        console.error("Erreur email:", e);
        // Не блокируем успех, если письмо не ушло
    }

    // renovle la liste d'utilisateurs
    revalidatePath("/admin/users");
    // on vide le cache
    revalidatePath("/", "layout");
    return { success: true };
}


export async function rejectUser(targetUserId: string, targetEmail: string) {
    const supabase = await createClient();

    // 1. Vérif Admin
    const { data: { user } } = await supabase.auth.getUser();
    // (Tu peux ajouter une vérif de rôle ici si tu veux sécuriser à 100%)

    // 2. Envoi email de refus (facultatif, mais sympa)
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: targetEmail,
            subject: '❌ Votre inscription a été refusée',
            html: `
                <h1>Inscription refusée</h1>
                <p>Bonjour,</p>
                <p>Votre demande d'accès au Magasin MMI n'a pas été retenue par l'administrateur.</p>
                <p>Si vous pensez qu'il s'agit d'une erreur, contactez un responsable.</p>
            `
        });
    } catch (e) {
        console.error("Erreur email refus:", e);
    }

    // 3. Suppression du profil
    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

// app/actions/inventory.ts

// ... autres imports
// Ajoute cet import pour générer des noms de fichiers uniques (optionnel mais recommandé)
// ou utilise simplement Date.now() comme je vais faire ci-dessous.