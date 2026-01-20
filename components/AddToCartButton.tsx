"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Check, AlertCircle, PackageX } from "lucide-react";

type Props = {
    instrument: { id: number; name: string; image_url: string | null };
    availableQty: number;
    dates: {
        start: string;
        end: string;
        startTime: string;
        endTime: string;
    } | null;
    onSuccess?: () => void;
};

/**
 * Bouton "Ajouter au panier".
 * Gère désormais les conflits de dates via le retour de la fonction addToCart.
 */
export default function AddToCartButton({ instrument, availableQty, dates, onSuccess }: Props) {
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    // CAS 1 : Dates non sélectionnées
    if (!dates) {
        return (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl flex items-center gap-3 animate-in fade-in">
                <AlertCircle size={18} className="shrink-0" />
                <span>Veuillez sélectionner une période de réservation ci-dessus.</span>
            </div>
        );
    }

    // CAS 2 : Rupture de stock
    if (availableQty <= 0) {
        return (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium flex items-center justify-center gap-2 animate-in fade-in">
                <PackageX size={18} />
                Rupture de stock sur cette période.
            </div>
        );
    }

    // Fonction d'ajout avec gestion d'erreur
    const handleAdd = () => {
        const result = addToCart({
            id: instrument.id,
            name: instrument.name,
            image_url: instrument.image_url,
            quantity: qty,
            maxQuantity: availableQty,
            startDate: dates.start,
            endDate: dates.end,
            startTime: dates.startTime,
            endTime: dates.endTime
        });

        // VÉRIFICATION DU RÉSULTAT
        if (result.success) {
            // SUCCÈS : On lance l'animation
            setAdded(true);
            setTimeout(() => {
                setAdded(false);
                if (onSuccess) onSuccess();
            }, 1000);
        } else {
            // ÉCHEC (Conflit de dates) : On avertit l'utilisateur
            alert("⛔ IMPOSSIBLE D'AJOUTER AU PANIER\n\n" + (result.error || "Erreur inconnue"));
        }
    };

    // CAS 3 : Affichage normal
    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Sélecteur de Quantité */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</label>
                <div className="flex items-center gap-2">
                    <select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="py-1 px-2 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                        {Array.from({ length: availableQty }).map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                    </select>
                    <span className="text-xs text-slate-400 font-medium">/ {availableQty} dispo</span>
                </div>
            </div>

            {/* Bouton d'action */}
            <button
                onClick={handleAdd}
                disabled={added}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-sm
                    ${added
                    ? "bg-emerald-500 text-white scale-95"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5"
                }
                `}
            >
                {added ? (
                    <>
                        <Check size={20} strokeWidth={3} />
                        Ajouté au panier !
                    </>
                ) : (
                    <>
                        <ShoppingCart size={20} />
                        Ajouter au panier
                    </>
                )}
            </button>
        </div>
    );
}