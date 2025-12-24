// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Тип товара из корзины для сервера
type CartItemPayload = {
    id: number;
    quantity: number;
    startDate: string;
    endDate: string;
};

export async function submitCartReservation(items: CartItemPayload[], message: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    if (items.length === 0) return { error: "Le panier est vide." };

    // 1. Проверяем доступность КАЖДОГО товара перед записью
    for (const item of items) {
        // Получаем общее кол-во
        const { data: instrument } = await supabase
            .from("instruments")
            .select("quantite, name")
            .eq("id", item.id)
            .single();

        if (!instrument) continue;

        // Считаем занятые в этот период
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

    // 2. Если все ок, создаем записи
    const reservationsToInsert = items.map(item => ({
        user_id: user.id,
        instrument_id: item.id,
        date_debut: item.startDate,
        date_fin: item.endDate,
        quantity: item.quantity, // Пишем количество!
        message: message,
        statut: "en attente"
    }));

    const { error } = await supabase.from("reservations").insert(reservationsToInsert);

    if (error) return { error: error.message };

    revalidatePath("/mes-reservations");
    revalidatePath("/");
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

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') return { error: "Interdit" };

    const name = formData.get("name") as string;
    const categorie = formData.get("categorie") as string;
    const image_url = formData.get("image_url") as string;
    const description = formData.get("description") as string;

    if (!name) return { error: "Le nom est obligatoire" };

    const { error } = await supabase.from("instruments").insert({
        name,
        categorie,
        image_url,
        description,
        status: "dispo",
        quantite: 1
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/inventaire");
    revalidatePath("/");
    return { success: true };
}