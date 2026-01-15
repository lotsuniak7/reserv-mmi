"use client";

import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon, Image as ImageIcon } from "lucide-react";
import ProductCalendar from "@/components/ProductCalendar";
import AddToCartButton from "@/components/AddToCartButton";
import { getInstrumentReservations } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

// Types
type InstrumentLite = {
    id: number;
    name: string;
    description?: string | null;
    image_url: string | null;
    quantite: number | null;
};

type Props = {
    instrument: InstrumentLite | null;
    isOpen: boolean;
    onClose: () => void;
    initialDateStart: string;
    initialDateEnd: string;
};

/**
 * Modal Détail Produit.
 * Affiche les infos, le calendrier de disponibilité et permet d'ajouter au panier.
 */
export default function ProductModal({ instrument, isOpen, onClose, initialDateStart, initialDateEnd }: Props) {
    const [reservations, setReservations] = useState<any[]>([]);

    // NOUVEAU : On stocke la quantité TOTALE réelle (ex: 6) pour éviter le bug de double soustraction
    const [realTotalQty, setRealTotalQty] = useState<number | null>(null);

    // États locaux pour les dates dans le modal
    const [startDate, setStartDate] = useState(initialDateStart);
    const [endDate, setEndDate] = useState(initialDateEnd);
    const [errorMsg, setErrorMsg] = useState("");

    // Limites de dates
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const maxLimit = nextYear.toISOString().split("T")[0];

    // Chargement des données à l'ouverture
    useEffect(() => {
        if (instrument && isOpen) {
            // 1. Récupère les résas pour le calendrier
            getInstrumentReservations(instrument.id).then(data => setReservations(data || []));

            // 2. CORRECTION DU BUG : On récupère la quantité TOTALE physique depuis la base
            // Car instrument.quantite contient peut-être déjà le "reste" calculé par la page précédente.
            const supabase = createClient();
            supabase
                .from('instruments')
                .select('quantite')
                .eq('id', instrument.id)
                .single()
                .then(({ data }) => {
                    if (data) setRealTotalQty(data.quantite);
                });

            // Initialise les dates
            setStartDate(initialDateStart);
            setEndDate(initialDateEnd);
            setErrorMsg("");
        }
    }, [instrument, isOpen, initialDateStart, initialDateEnd]);

    // Validation des dates en temps réel
    useEffect(() => {
        if (!startDate || !endDate) {
            setErrorMsg("");
            return;
        }
        if (startDate < today) {
            setErrorMsg("La date de début ne peut pas être dans le passé.");
            return;
        }
        if (endDate < startDate) {
            setErrorMsg("La date de fin doit être après la date de début.");
            return;
        }
        if (endDate > maxLimit) {
            setErrorMsg("Les réservations sont limitées à 1 an.");
            return;
        }
        setErrorMsg("");
    }, [startDate, endDate, today, maxLimit]);

    if (!isOpen || !instrument) return null;

    // Calcul de la disponibilité
    // CORRECTION : On utilise realTotalQty (6) s'il est chargé, sinon on utilise instrument.quantite en secours
    const baseQuantity = realTotalQty ?? instrument.quantite ?? 1;

    let availableQty = baseQuantity;

    if (startDate && endDate && !errorMsg) {
        // On compte combien sont déjà pris sur cette période
        const reservedCount = reservations
            .filter(r => r.date_debut <= endDate && r.date_fin >= startDate)
            .reduce((sum, r) => sum + (r.quantity || 1), 0);

        // Maintenant le calcul est juste : 6 - 3 = 3
        availableQty = Math.max(0, baseQuantity - reservedCount);
    }

    return (
        // Overlay sombre
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Conteneur Modal */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Bouton Fermer */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* --- COLONNE GAUCHE : Image & Infos --- */}
                <div className="w-full md:w-5/12 p-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col gap-6 overflow-y-auto">
                    <div className="aspect-video bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                        {instrument.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={instrument.image_url} alt={instrument.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-300 gap-2">
                                <ImageIcon size={40} strokeWidth={1.5} />
                                <span className="text-xs uppercase font-bold tracking-wider">Pas d'image</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">{instrument.name}</h2>
                        <div className="prose prose-sm text-slate-600">
                            <p className="leading-relaxed">
                                {instrument.description || "Aucune description détaillée n'est disponible pour cet équipement."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- COLONNE DROITE : Calendrier & Actions --- */}
                <div className="w-full md:w-7/12 p-6 flex flex-col h-full overflow-y-auto bg-white">

                    {/* Calendrier */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2 tracking-wider">
                            <CalendarIcon size={14}/> Disponibilité
                        </h3>
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                            {/* Assure-toi d'avoir ce composant ou remplace par un placeholder */}
                            <ProductCalendar reservations={reservations} />
                        </div>
                    </div>

                    {/* Sélecteur de Dates */}
                    <div className={`grid grid-cols-2 gap-4 bg-white border p-4 rounded-xl shadow-sm transition-colors mb-4 ${errorMsg ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 hover:border-indigo-300'}`}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Début</label>
                            <input
                                type="date"
                                min={today}
                                max={maxLimit}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="text-sm font-medium outline-none text-slate-700 bg-transparent w-full cursor-pointer"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 text-right border-l border-slate-100 pl-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fin</label>
                            <input
                                type="date"
                                min={startDate || today}
                                max={maxLimit}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="text-sm font-medium outline-none text-slate-700 bg-transparent w-full text-right cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Bouton d'action */}
                    <div className="mt-auto">
                        {errorMsg ? (
                            <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed">
                                Dates invalides
                            </button>
                        ) : (
                            <AddToCartButton
                                instrument={instrument}
                                availableQty={availableQty} // Ici, on passe la vraie quantité calculée
                                dates={startDate && endDate ? { start: startDate, end: endDate } : null}
                                onSuccess={onClose}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}