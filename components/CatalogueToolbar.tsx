"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialCard from "@/components/MaterialCard";
import { Calendar, Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductModal from "@/components/ProductModal";

/**
 * Barre d'outils du Catalogue (CatalogueToolbar).
 * Composant central qui gère :
 * 1. Le filtrage (Recherche texte + Catégorie).
 * 2. La sélection des dates (Début / Fin).
 * 3. La pagination et l'affichage en grille des produits.
 * 4. L'ouverture du Modal de détails.
 */

// Type exporté pour être utilisé dans les composants enfants
export type InstrumentLite = {
    id: number;
    name: string;
    status: string;
    categorie: string | null;
    quantite: number | null;
    image_url: string | null;
    description?: string | null;
};

type Props = {
    items: InstrumentLite[];
    categories: string[];
};

// Configuration : Nombre d'articles par page
const ITEMS_PER_PAGE = 15;

export default function CatalogueToolbar({ items, categories }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- ÉTATS (State) ---
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);

    // Dates (récupérées depuis l'URL)
    const [dateStart, setDateStart] = useState(searchParams.get("start") || "");
    const [dateEnd, setDateEnd] = useState(searchParams.get("end") || "");

    const [selectedItem, setSelectedItem] = useState<InstrumentLite | null>(null);

    // Réinitialisation de la pagination si on change les filtres
    useEffect(() => {
        setCurrentPage(1);
    }, [q, cat]);

    // --- GESTION DES DATES ---
    function handleDateChange(start: string, end: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (start) params.set("start", start); else params.delete("start");
        if (end) params.set("end", end); else params.delete("end");
        router.push(`/catalogue?${params.toString()}`);
    }

    const onStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateStart(val);
        if ((val && dateEnd) || !val) handleDateChange(val, dateEnd);
    };

    const onEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateEnd(val);
        if ((dateStart && val) || !val) handleDateChange(dateStart, val);
    };

    const clearDates = () => {
        setDateStart("");
        setDateEnd("");
        router.push("/catalogue");
    };

    // --- FILTRAGE ---
    const filtered = useMemo(() => {
        return items.filter((it) => {
            const okCat = !cat || it.categorie === cat;
            const okText = !q || it.name.toLowerCase().includes(q.toLowerCase());
            return okCat && okText;
        });
    }, [items, q, cat]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    // (3. Découper la liste pour la page actuelle)
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    // Fonctions de navigation
    const goToNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const goToPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

    return (
        <div className="space-y-5">

            {/* Modal Produit */}
            <ProductModal
                instrument={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                initialDateStart={dateStart}
                initialDateEnd={dateEnd}
            />

            {/* PANNEAU DE FILTRES */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">

                <div className="p-5 space-y-4">
                    {/* Ligne 1 : Recherche et Catégorie */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Rechercher un instrument..."
                                className="border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        <div className="relative w-52">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={cat}
                                onChange={(e) => setCat(e.target.value)}
                                className="border border-slate-300 rounded-lg pl-10 pr-8 py-2.5 w-full text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition"
                            >
                                <option value="">Toutes catégories</option>
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Ligne 2 : Dates */}
                    <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-indigo-600" />
                            <span className="text-sm font-medium text-slate-600">Période de disponibilité</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex flex-col gap-1.5 w-40">
                                <label className="text-xs font-medium text-slate-500">Date de début</label>
                                <input
                                    type="date"
                                    value={dateStart}
                                    onChange={onStartChange}
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 w-40">
                                <label className="text-xs font-medium text-slate-500">Date de fin</label>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={onEndChange}
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            {(dateStart || dateEnd) && (
                                <button
                                    onClick={clearDates}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 transition self-end pb-2"
                                >
                                    <X size={14} />
                                    Effacer dates
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barre d'info */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{filtered.length}</span> instrument{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                    </span>
                    {totalPages > 1 && (
                        <span className="text-sm text-slate-500">
                            Page {currentPage} / {totalPages}
                        </span>
                    )}
                </div>
            </div>

            {/* LISTE DES PRODUITS (Grille) */}
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                {paginatedItems.map((it) => (
                    <div key={it.id} onClick={() => setSelectedItem(it)} className="cursor-pointer">
                        <MaterialCard {...it} />
                    </div>
                ))}
            </div>

            {/* ÉTAT VIDE */}
            {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <Search className="mx-auto mb-3 text-slate-300" size={40} />
                    <p className="font-medium">Aucun résultat trouvé</p>
                    <p className="text-sm text-slate-400 mt-1">Essayez de modifier vos critères de recherche</p>
                </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={goToPrev}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-sm font-medium"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                                        currentPage === pageNum
                                            ? 'bg-indigo-600 text-white'
                                            : 'border border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-sm font-medium"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}