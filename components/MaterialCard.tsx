"use client";

import { Camera, Package } from "lucide-react";

type Props = {
    id: number;
    name: string;
    status: string;          // 'dispo' | 'réservé' | 'indisponible'
    categorie?: string | null;
    quantite?: number | null;
    image_url?: string | null;
};

// Configuration des badges de statut
const statusMap: Record<string, { text: string; classes: string }> = {
    // Cas : Disponible
    dispo:        { text: "Dispo",        classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    disponible:   { text: "Dispo",        classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },

    // Cas : Réservé (ou stock épuisé temporairement)
    "réservé":    { text: "Réservé",      classes: "bg-amber-50 text-amber-700 border-amber-200" },
    reserve:      { text: "Réservé",      classes: "bg-amber-50 text-amber-700 border-amber-200" },

    // Cas : Indisponible (Cassé, perdu, etc.)
    indisponible: { text: "Indispo",      classes: "bg-red-50 text-red-700 border-red-200" },
    unavailable:  { text: "Indispo",      classes: "bg-red-50 text-red-700 border-red-200" },
};

/**
 * Carte Produit (MaterialCard).
 * Affiche un aperçu de l'instrument dans la grille du catalogue.
 * Gère l'affichage de l'image (ou un placeholder) et le statut.
 */
export default function MaterialCard({
                                         id, name, status, categorie, quantite, image_url,
                                     }: Props) {
    // Récupération du style selon le statut (ou style par défaut gris)
    const st = statusMap[status.toLowerCase()] ?? { text: status, classes: "bg-slate-100 text-slate-700 border-slate-200" };

    return (
        <article className="group bg-white rounded-xl border border-slate-200 p-3 h-full flex flex-col hover:shadow-md hover:border-indigo-300 transition-all duration-200">

            {/* 1. VIGNETTE IMAGE */}
            <div className="mb-3 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 relative">
                {/* Ratio 16/9 pour uniformiser les images */}
                <div className="w-full aspect-video flex items-center justify-center">
                    {image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image_url}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        // Placeholder si pas d'image
                        <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
                            <Camera size={24} />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Sans image</span>
                        </div>
                    )}
                </div>

                {/* Badge Quantité (Flottant sur l'image) */}
                {(typeof quantite === "number") && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                        x{quantite}
                    </div>
                )}
            </div>

            {/* 2. TITRE */}
            {/* line-clamp-2 coupe le texte s'il est trop long pour garder les cartes alignées */}
            <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2 min-h-[2.5rem]" title={name}>
                {name}
            </h3>

            {/* Spacer : Pousse le bas de la carte vers le bas */}
            <div className="flex-1" />

            {/* 3. PIED DE CARTE (Catégorie + Statut) */}
            <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">

                {/* Catégorie */}
                <div className="min-w-0 flex items-center gap-1.5 text-slate-500">
                    <Package size={14} className="shrink-0" />
                    <span className="text-xs font-medium truncate" title={categorie || "Divers"}>
                        {categorie || "Autre"}
                    </span>
                </div>

                {/* Badge Statut */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${st.classes}`}>
                    {st.text}
                </span>
            </div>
        </article>
    );
}