"use client";

// Barre d’outils : recherche + filtre catégorie (côté client)
import { useMemo, useState } from "react";
import MaterialCard from "@/components/MaterialCard";

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
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<string>("");

    const filtered = useMemo(() => {
        return items.filter((it) => {
            const okCat = !cat || it.categorie === cat;
            const okText = !q || it.name.toLowerCase().includes(q.toLowerCase());
            return okCat && okText;
        });
    }, [items, q, cat]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher un matériel…"
                    className="border rounded-md px-3 py-2 w-full sm:w-1/2"
                />
                <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="border rounded-md px-3 py-2 w-full sm:w-1/3"
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                {filtered.length === 0 ? (
                    <div className="card p-4 col-span-full text-sm">
                        Aucun résultat pour cette recherche.
                    </div>
                ) : (
                    filtered.map((it) => <MaterialCard key={it.id} {...it} />)
                )}
            </div>
        </div>
    );
}