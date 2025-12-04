import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReservationButton from "@/components/ReservationButton";
import ProductCalendar from "@/components/ProductCalendar"; // <--- Импорт

// ... Тип Instrument (оставляем как есть) ...

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;

    // 1. Загружаем инструмент
    const { data: it, error } = await supabase
        .from("instruments")
        .select("*")
        .eq("id", Number(id))
        .single();

    if (error || !it) notFound();

    // 2. Загружаем БРОНИРОВАНИЯ для этого инструмента (чтобы показать календарь)
    const { data: reservations } = await supabase
        .from("reservations")
        .select("date_debut, date_fin")
        .eq("instrument_id", it.id)
        .neq("statut", "refusée")
        .neq("statut", "terminée");

    // ... (код статусов statusMap оставляем) ...
    const statusMap: Record<string, { text: string; classes: string }> = {
        dispo: { text: "disponible", classes: "bg-green-100 text-green-700" },
        available: { text: "disponible", classes: "bg-green-100 text-green-700" },
        "réservé": { text: "réservé", classes: "bg-amber-100 text-amber-700" },
        indisponible: { text: "indisponible", classes: "bg-red-100 text-red-700" },
    };
    const st = statusMap[it.status] ?? { text: it.status, classes: "bg-slate-100 text-slate-700" };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Хлебные крошки и Картинка (оставляем как было) */}

            {/* ... блок с картинкой ... */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* ЛЕВАЯ КОЛОНКА: Описание и Характеристики (2/3 ширины) */}
                <div className="md:col-span-2 card p-6 space-y-6 h-fit">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">{it.name}</h1>
                        {/* Бейдж статуса */}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.classes}`}>
                            {st.text}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Description</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            {it.description || "Aucune description."}
                        </p>
                    </div>

                    {/* Характеристики (оставляем код) */}
                    {/* ... */}
                </div>

                {/* ПРАВАЯ КОЛОНКА: Календарь и Кнопка (1/3 ширины) */}
                <div className="space-y-6">
                    {/* Блок действия */}
                    <div className="card p-5 bg-slate-50 border-slate-200 space-y-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">Disponibilité</h3>

                        {/* Вставляем календарь */}
                        <ProductCalendar reservations={reservations || []} />

                        <div className="pt-2">
                            <ReservationButton instrumentId={it.id} instrumentName={it.name} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}