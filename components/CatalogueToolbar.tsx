"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialCard from "@/components/MaterialCard";
import { Calendar, Search, Filter, X } from "lucide-react"; // Импортируем иконки

export type InstrumentLite = {
    id: number;
    name: string;
    status: string;
    categorie: string | null;
    quantite: number | null;
    image_url: string | null;
};

type Props = {
    items: InstrumentLite[];
    categories: string[];
};

export default function CatalogueToolbar({ items, categories }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Состояние для фильтров на клиенте
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<string>("");

    // Состояние для дат (читаем из URL при загрузке)
    const [dateStart, setDateStart] = useState(searchParams.get("start") || "");
    const [dateEnd, setDateEnd] = useState(searchParams.get("end") || "");

    // Функция обновления URL при изменении дат
    function handleDateChange(start: string, end: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (start) params.set("start", start); else params.delete("start");
        if (end) params.set("end", end); else params.delete("end");
        router.push(`/?${params.toString()}`);
    }

    // Обработчики изменения инпутов
    const onStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateStart(val);
        // Если обе даты заполнены или одна очищена, обновляем список
        if ((val && dateEnd) || !val) handleDateChange(val, dateEnd);
    };

    const onEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateEnd(val);
        if ((dateStart && val) || !val) handleDateChange(dateStart, val);
    };

    // Сброс фильтров даты
    const clearDates = () => {
        setDateStart("");
        setDateEnd("");
        router.push("/");
    };

    // Клиентская фильтрация (Текст + Категория)
    const filtered = useMemo(() => {
        return items.filter((it) => {
            const okCat = !cat || it.categorie === cat;
            const okText = !q || it.name.toLowerCase().includes(q.toLowerCase());
            return okCat && okText;
        });
    }, [items, q, cat]);

    return (
        <div className="space-y-6">

            {/* Блок фильтров */}
            <div className="bg-white p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-4">

                {/* Ряд 1: Даты (Фильтрация доступности) */}
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center pb-4 border-b border-dashed border-slate-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] min-w-max">
                        <Calendar size={18} />
                        <span>Disponibilité :</span>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Du</label>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={onStartChange}
                                className="border rounded-md px-3 py-1.5 text-sm bg-slate-50 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Au</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={onEndChange}
                                className="border rounded-md px-3 py-1.5 text-sm bg-slate-50 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>

                    {(dateStart || dateEnd) && (
                        <button
                            onClick={clearDates}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-auto pb-2"
                        >
                            <X size={14} /> Effacer dates
                        </button>
                    )}
                </div>

                {/* Ряд 2: Поиск и Категория (Фильтрация списка) */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Rechercher un modèle (ex: Canon)..."
                            className="border rounded-md pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        />
                    </div>

                    <div className="relative w-full sm:w-1/3">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={cat}
                            onChange={(e) => setCat(e.target.value)}
                            className="border rounded-md pl-10 pr-8 py-2 w-full appearance-none bg-white focus:ring-2 focus:ring-[var(--primary)] outline-none cursor-pointer"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Результаты */}
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="text-sm text-[var(--text-secondary)] font-medium">
                            Aucun matériel trouvé pour ces critères.
                        </p>
                        {(dateStart && dateEnd) && (
                            <p className="text-xs text-slate-400 mt-1">
                                Essayez de changer vos dates de réservation.
                            </p>
                        )}
                    </div>
                ) : (
                    filtered.map((it) => <MaterialCard key={it.id} {...it} />)
                )}
            </div>
        </div>
    );
}