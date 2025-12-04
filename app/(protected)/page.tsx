import CatalogueToolbar, { InstrumentLite } from "@/components/CatalogueToolbar";
import { createClient } from "@/lib/supabase/server";

// Принимаем searchParams для чтения дат из URL
export default async function Page({ searchParams }: { searchParams: Promise<{ start?: string, end?: string }> }) {
    const supabase = await createClient();

    // Ждем параметры
    const params = await searchParams;
    const start = params.start;
    const end = params.end;

    let bookedIds: number[] = [];

    // 1. Если даты выбраны, ищем ID занятых предметов
    if (start && end) {
        const { data: conflicts, error: conflictError } = await supabase
            .from("reservations")
            .select("instrument_id")
            .neq("statut", "refusée")     // Игнорируем отказы
            .neq("statut", "terminée")    // Игнорируем завершенные (на всякий случай, хотя логика дат важнее)
            // Логика пересечения интервалов:
            .lte("date_debut", end)       // Начало брони <= Конец поиска
            .gte("date_fin", start);      // Конец брони >= Начало поиска

        if (!conflictError && conflicts) {
            // Собираем массив ID: [1, 5, 8...]
            bookedIds = conflicts.map((c) => c.instrument_id);
        }
    }

    // 2. Загружаем инструменты
    let query = supabase
        .from("instruments")
        .select("id,name,status,categorie,quantite,image_url")
        .order("name", { ascending: true });

    // Если есть занятые ID, исключаем их из выборки
    if (bookedIds.length > 0) {
        query = query.not("id", "in", `(${bookedIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
        return (
            <div className="card p-4 bg-red-50 text-red-600">
                <div className="font-semibold mb-2">Erreur de chargement</div>
                <pre className="text-sm">{error.message}</pre>
            </div>
        );
    }

    const items = (data ?? []) as InstrumentLite[];

    // Собираем категории из ВСЕХ загруженных (доступных) предметов
    const categories = Array.from(
        new Set(items.map((i) => i.categorie).filter((x): x is string => !!x))
    ).sort((a, b) => a.localeCompare(b));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Catalogue
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Réservez le matériel du MMI Dijon.
                </p>
            </div>

            {/* Передаем товары в Toolbar */}
            <CatalogueToolbar items={items} categories={categories} />
        </div>
    );
}