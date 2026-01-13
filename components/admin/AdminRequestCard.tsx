"use client";

import { updateLineStatus } from "@/app/actions";
import { useState } from "react";
import { Check, X, User, MessageSquare, Calendar, Package } from "lucide-react";

// Définition simple des types pour éviter le "any"
type ReservationItem = {
    id: number;
    quantity: number;
    date_debut: string;
    date_fin: string;
    statut: string;
    message?: string;
    instruments: {
        name: string;
        image_url: string | null;
    } | null;
};

type RequestWithDetails = {
    id: number;
    created_at: string;
    message: string | null;
    profiles: {
        full_name: string | null;
        email: string | null;
    } | null;
    reservations: ReservationItem[];
};

/**
 * Composant Carte de Demande (Admin).
 * Affiche une demande complète (Dossier) et permet de valider/refuser chaque ligne individuellement.
 */
export default function AdminRequestCard({ request }: { request: RequestWithDetails }) {
    // États locaux
    const [rejectionId, setRejectionId] = useState<number | null>(null); // ID de la ligne en cours de refus
    const [reason, setReason] = useState(""); // Motif du refus
    const [loading, setLoading] = useState(false);

    // Formatage de la date
    const createdDate = new Date(request.created_at).toLocaleDateString("fr-FR", {
        day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'
    });

    // Action : Valider une ligne
    async function handleValidate(id: number) {
        setLoading(true);
        await updateLineStatus(id, "validée");
        setLoading(false);
    }

    // Action : Refuser une ligne (avec motif)
    async function handleRefuse() {
        if (!rejectionId || !reason.trim()) return;
        setLoading(true);
        await updateLineStatus(rejectionId, "refusée", reason);
        setLoading(false);
        // Réinitialisation
        setRejectionId(null);
        setReason("");
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 transition hover:shadow-md">

            {/* 1. EN-TÊTE DU DOSSIER */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                            Dossier #{request.id}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                            User : <span className="font-semibold text-slate-700">
                                {request.profiles?.full_name || request.profiles?.email || "Utilisateur inconnu"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                    <Calendar size={14} className="text-slate-400"/> {createdDate}
                </div>
            </div>

            {/* 2. MESSAGE GLOBAL (Optionnel) */}
            {request.message && (
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex gap-3 items-start">
                    <MessageSquare size={16} className="text-amber-500 mt-1 shrink-0" />
                    <p className="text-sm text-amber-900 italic">
                        <span className="font-bold mr-1">Note de l'étudiant :</span>
                        "{request.message}"
                    </p>
                </div>
            )}

            {/* 3. LISTE DES RÉSERVATIONS */}
            <div className="divide-y divide-slate-100">
                {request.reservations.map((resa) => (
                    <div key={resa.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition">

                        {/* Image */}
                        <div className="w-16 h-12 bg-white rounded border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {resa.instruments?.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resa.instruments.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <Package className="text-slate-300" size={20} />
                            )}
                        </div>

                        {/* Infos Détails */}
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-slate-800">{resa.instruments?.name || "Instrument supprimé"}</div>
                            <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-1 items-center">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono font-medium text-slate-600">
                                    Qté: {resa.quantity}
                                </span>
                                <span className="flex items-center gap-1">
                                    {new Date(resa.date_debut).toLocaleDateString("fr-FR")}
                                    <span className="text-slate-300">➜</span>
                                    {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                </span>
                            </div>

                            {/* Affichage du motif si refusé */}
                            {resa.statut === 'refusée' && resa.message && (
                                <div className="text-xs text-red-600 mt-2 bg-red-50 inline-block px-2 py-1 rounded border border-red-100">
                                    <strong>Motif :</strong> {resa.message}
                                </div>
                            )}
                        </div>

                        {/* BOUTONS D'ACTION */}
                        <div className="shrink-0 mt-2 sm:mt-0">
                            {resa.statut === 'en attente' ? (
                                <div className="flex items-center gap-2">
                                    {rejectionId === resa.id ? (
                                        // Mode : Saisie du motif de refus
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                                            <input
                                                autoFocus
                                                placeholder="Motif du refus..."
                                                className="text-xs border border-red-300 bg-red-50 rounded px-2 py-1 w-40 outline-none focus:ring-1 focus:ring-red-500"
                                                value={reason}
                                                onChange={e => setReason(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRefuse()}
                                            />
                                            <button
                                                onClick={handleRefuse}
                                                disabled={loading}
                                                className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition"
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setRejectionId(null)}
                                                className="p-1 text-slate-400 hover:text-slate-600"
                                            >
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    ) : (
                                        // Mode : Boutons Normaux
                                        <>
                                            <button
                                                onClick={() => handleValidate(resa.id)}
                                                disabled={loading || rejectionId !== null}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded hover:bg-green-100 border border-green-200 transition"
                                                title="Valider cette ligne"
                                            >
                                                <Check size={14} /> Valider
                                            </button>
                                            <button
                                                onClick={() => { setRejectionId(resa.id); setReason(""); }}
                                                disabled={loading || rejectionId !== null}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded hover:bg-red-100 border border-red-200 transition"
                                                title="Refuser cette ligne"
                                            >
                                                <X size={14} /> Refuser
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // Badge de statut (si déjà traité)
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                    resa.statut === 'validée'
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                    {resa.statut}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}