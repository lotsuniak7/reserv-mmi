"use client";

import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon, Image as ImageIcon, Clock } from "lucide-react";
import ProductCalendar from "@/components/ProductCalendar";
import AddToCartButton from "@/components/AddToCartButton";
import { getInstrumentReservations } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";

// --- TYPES ---
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
 * Composant Modal : Détails du Produit & Réservation.
 * Permet de visualiser les disponibilités et de choisir un créneau précis (Dates + Heures).
 */
export default function ProductModal({ instrument, isOpen, onClose, initialDateStart, initialDateEnd }: Props) {
    // Connexion au contexte Panier pour vérifier les quantités déjà prises localement
    const { cart } = useCart();

    // États des données (Réservations existantes en base + Stock total réel)
    const [reservations, setReservations] = useState<any[]>([]);
    const [realTotalQty, setRealTotalQty] = useState<number | null>(null);

    // --- ÉTATS DU FORMULAIRE (Dates & Heures) ---
    const [startDate, setStartDate] = useState(initialDateStart);
    const [endDate, setEndDate] = useState(initialDateEnd);

    // NOUVEAU : Gestion des heures (par défaut 09:00 - 17:00, horaires de bureau classiques)
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");

    const [errorMsg, setErrorMsg] = useState("");

    // Configuration des limites temporelles (Min = Aujourd'hui, Max = +1 an)
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const maxLimit = nextYear.toISOString().split("T")[0];

    // Chargement des données à l'ouverture du modal
    useEffect(() => {
        if (instrument && isOpen) {
            // 1. Récupération des réservations validées (pour le calendrier)
            getInstrumentReservations(instrument.id).then(data => setReservations(data || []));

            // 2. Récupération de la quantité totale physique (Source de vérité)
            const supabase = createClient();
            supabase
                .from('instruments')
                .select('quantite')
                .eq('id', instrument.id)
                .single()
                .then(({ data }) => {
                    if (data) setRealTotalQty(data.quantite);
                });

            // 3. Réinitialisation des champs
            setStartDate(initialDateStart);
            setEndDate(initialDateEnd);
            setStartTime("09:00"); // Reset heure
            setEndTime("17:00");   // Reset heure
            setErrorMsg("");
        }
    }, [instrument, isOpen, initialDateStart, initialDateEnd]);

    // --- VALIDATION LOGIQUE (Dates & Heures) ---
    useEffect(() => {
        if (!startDate || !endDate) {
            setErrorMsg("");
            return;
        }
        // Règle 1 : Pas de date dans le passé
        if (startDate < today) {
            setErrorMsg("La date de début ne peut pas être dans le passé.");
            return;
        }
        // Règle 2 : Incohérence chronologique des jours
        if (endDate < startDate) {
            setErrorMsg("La date de fin doit être postérieure à la date de début.");
            return;
        }
        // Règle 3 : Limite de temps (1 an)
        if (endDate > maxLimit) {
            setErrorMsg("Les réservations sont limitées à 1 an.");
            return;
        }
        // Règle 4 : Incohérence horaire (Si c'est le MEME jour)
        if (startDate === endDate && startTime >= endTime) {
            setErrorMsg("Pour une réservation sur la même journée, l'heure de retour doit être après l'heure de départ.");
            return;
        }

        setErrorMsg("");
    }, [startDate, endDate, startTime, endTime, today, maxLimit]);

    if (!isOpen || !instrument) return null;

    // --- CALCUL DU STOCK DISPONIBLE (Algorithme critique) ---
    // Stock Dispo = Total Physique - (Occupé par les autres en DB) - (Occupé par moi dans le panier)
    const baseQuantity = realTotalQty ?? instrument.quantite ?? 1;
    let availableQty = baseQuantity;

    if (startDate && endDate && !errorMsg) {
        // 1. Ce qui est pris en BASE DE DONNÉES (chevauchement de dates)
        const reservedInDb = reservations
            .filter(r => r.date_debut <= endDate && r.date_fin >= startDate)
            .reduce((sum, r) => sum + (r.quantity || 1), 0);

        // 2. Ce qui est DÉJÀ DANS MON PANIER (pour éviter de réserver 2x le même objet unique)
        const reservedInCart = cart
            .filter(item =>
                item.id === instrument.id &&        // Même objet
                item.startDate <= endDate &&        // Chevauchement date début
                item.endDate >= startDate           // Chevauchement date fin
            )
            .reduce((sum, item) => sum + item.quantity, 0);

        // 3. Résultat final (borné à 0 minimum)
        availableQty = Math.max(0, baseQuantity - reservedInDb - reservedInCart);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* --- COLONNE GAUCHE (Image & Infos) --- */}
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

                {/* --- COLONNE DROITE (Actions) --- */}
                <div className="w-full md:w-7/12 p-6 flex flex-col h-full overflow-y-auto bg-white">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2 tracking-wider">
                            <CalendarIcon size={14}/> Disponibilité
                        </h3>
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                            <ProductCalendar reservations={reservations} />
                        </div>
                    </div>

                    {/* BLOC SÉLECTION DATES ET HEURES */}
                    <div className={`grid grid-cols-2 gap-4 bg-white border p-4 rounded-xl shadow-sm transition-colors mb-4 ${errorMsg ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 hover:border-indigo-300'}`}>

                        {/* Date & Heure DÉBUT */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Début</label>
                            <input
                                type="date"
                                min={today}
                                max={maxLimit}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="text-sm font-bold text-slate-700 outline-none w-full cursor-pointer bg-transparent"
                            />
                            {/* Input Time */}
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                                <Clock size={14} className="text-indigo-500"/>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="bg-transparent text-sm font-mono font-medium outline-none w-full text-slate-700 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Date & Heure FIN */}
                        <div className="flex flex-col gap-2 text-right border-l border-slate-100 pl-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fin</label>
                            <input
                                type="date"
                                min={startDate || today}
                                max={maxLimit}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="text-sm font-bold text-slate-700 outline-none w-full text-right cursor-pointer bg-transparent"
                            />
                            {/* Input Time */}
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 justify-end focus-within:ring-2 focus-within:ring-indigo-100 transition">
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="bg-transparent text-sm font-mono font-medium outline-none text-right w-full text-slate-700 cursor-pointer"
                                />
                                <Clock size={14} className="text-indigo-500"/>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        {errorMsg ? (
                            <button disabled className="w-full py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-sm cursor-not-allowed">
                                {errorMsg}
                            </button>
                        ) : (
                            <AddToCartButton
                                instrument={instrument}
                                availableQty={availableQty}
                                // On passe toutes les infos temporelles au bouton
                                dates={startDate && endDate ? {
                                    start: startDate,
                                    end: endDate,
                                    startTime: startTime, // <-- Ajouté
                                    endTime: endTime      // <-- Ajouté
                                } : null}
                                onSuccess={onClose}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}