import CatalogueToolbar, { InstrumentLite } from "@/components/CatalogueToolbar";
import { createClient } from "@/lib/supabase/server";

export default async function Page({ searchParams }: { searchParams: Promise<{ start?: string, end?: string }> }) {
    const supabase = await createClient();
    const params = await searchParams;
    const start = params.start;
    const end = params.end;

    // 1. Загружаем ВСЕ инструменты
    const { data: allInstruments, error } = await supabase
        .from("instruments")
        .select("id,name,status,categorie,quantite,image_url")
        .order("name", { ascending: true });

    if (error) return <div>Erreur: {error.message}</div>;

    let items = (allInstruments ?? []) as InstrumentLite[];

    // 2. Если даты выбраны, считаем реальную доступность
    if (start && end) {
        // Получаем все пересекающиеся брони
        const { data: conflicts } = await supabase
            .from("reservations")
            .select("instrument_id, quantity")
            .neq("statut", "refusée")
            .neq("statut", "terminée")
            .lte("date_debut", end)
            .gte("date_fin", start);

        // Создаем карту: ID инструмента -> Сколько занято
        const reservedMap: Record<number, number> = {};
        conflicts?.forEach((c) => {
            // Если quantity в базе еще нет (старые записи), считаем как 1
            const qty = c.quantity ?? 1;
            reservedMap[c.instrument_id] = (reservedMap[c.instrument_id] || 0) + qty;
        });

        // Обновляем список: вычитаем занятое из общего
        items = items.map((it) => {
            const total = it.quantite ?? 1;
            const reserved = reservedMap[it.id] || 0;
            const available = Math.max(0, total - reserved);

            return {
                ...it,
                quantite: available, // ПОДМЕНЯЕМ количество на доступное!
                // Если доступно 0, меняем статус (визуально)
                status: available === 0 ? "indisponible" : it.status
            };
        });
    }

    const categories = Array.from(new Set(items.map((i) => i.categorie).filter((x): x is string => !!x))).sort();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Catalogue</h1>
                <p className="text-[var(--text-secondary)]">Réservez le matériel du MMI Dijon.</p>
            </div>
            {/* Передаем already calculated items */}
            <CatalogueToolbar items={items} categories={categories} />
        </div>
    );
}