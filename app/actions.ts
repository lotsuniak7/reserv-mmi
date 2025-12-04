// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Création de réservation AVEC VÉRIFICATION
export async function createReservation(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const instrument_id = Number(formData.get("instrument_id"));
    const date_debut = formData.get("date_debut") as string;
    const date_fin = formData.get("date_fin") as string;
    const message = formData.get("message") as string;

    if (!instrument_id || !date_debut || !date_fin) {
        return { error: "Veuillez remplir les dates obligatoires." };
    }

    if (new Date(date_debut) > new Date(date_fin)) {
        return { error: "La date de début doit être avant la date de fin." };
    }

    // --- VÉRIFICATION DE DISPONIBILITÉ ---
    // On cherche s'il existe une réservation qui chevauche ces dates pour cet instrument
    // (Statut qui n'est ni 'refusée' ni 'terminée')
    const { data: conflicts, error: checkError } = await supabase
        .from("reservations")
        .select("id")
        .eq("instrument_id", instrument_id)
        .neq("statut", "refusée")
        .neq("statut", "terminée")
        // Logique de chevauchement : (DébutA <= FinB) et (FinA >= DébutB)
        .lte("date_debut", date_fin)
        .gte("date_fin", date_debut);

    if (checkError) {
        return { error: "Erreur lors de la vérification : " + checkError.message };
    }

    if (conflicts && conflicts.length > 0) {
        return { error: "Ce matériel est déjà réservé pour tout ou partie de cette période." };
    }
    // -------------------------------------

    const { error } = await supabase.from("reservations").insert({
        user_id: user.id,
        instrument_id,
        date_debut,
        date_fin,
        message,
        statut: "en attente"
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/mes-reservations");
    revalidatePath("/materiels");
    revalidatePath("/admin");

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