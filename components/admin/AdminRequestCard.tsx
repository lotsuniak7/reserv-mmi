"use client";

import { updateReservationStatus } from "@/app/actions"; // <--- Nom corrigé ici
import { useState } from "react";
import { Check, X, User, MessageSquare, Calendar, Package, AlertCircle, Loader2 } from "lucide-react";

// --- DÉFINITION DES TYPES ---
// Ces types doivent correspondre à ce que tu récupères dans ta requête Supabase (page admin)

type ReservationItem = {
    id: number;
    quantity: number;
    date_debut: string;
    date_fin: string;
    statut: string;
    message?: string; // Motif du refus
    instruments: {
        name: string;
        image_url: string | null;
    } | null;
};

type RequestWithDetails = {
    id: number;
    created_at: string;
    message: string | null;
    // Attention : Assure-toi que ta requête SQL récupère bien "profiles"
    profiles: {
        full_name: string | null;
        email: string | null;
    } | null;
    reservations: ReservationItem[];
};

/**
 * Carte de Demande (AdminRequestCard).
 * Affiche un dossier complet et permet de gérer chaque ligne (Valider / Refuser avec motif).
 */
export default function AdminRequestCard({ request }: { request: RequestWithDetails }) {
    // --- ÉTATS ---
    const [rejectionId, setRejectionId] = useState<number | null>(null); // ID de la ligne en cours de refus
    const [reason, setReason] = useState(""); // Texte du motif
    const [loading, setLoading] = useState(false); // État de chargement global pour la carte

    // Formatage propre de la date
    const createdDate = new Date(request.created_at).toLocaleDateString("fr-FR", {
        day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'
    });

    // --- ACTIONS ---

    // 1. Valider une ligne
    async function handleValidate(id: number) {
        setLoading(true);
        try {
            await updateReservationStatus(id, "validée");
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la validation.");
        } finally {
            setLoading(false);
        }
    }

    // 2. Refuser une ligne (avec le motif saisi)
    async function handleRefuse() {
        if (!rejectionId || !reason.trim()) return;

        setLoading(true);
        try {
            await updateReservationStatus(rejectionId, "refusée", reason);
            // Réinitialisation du formulaire après succès
            setRejectionId(null);
            setReason("");
        } catch (e) {
            console.error(e);
            alert("Erreur lors du refus.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 transition hover:shadow-md">

            {/* 1. EN-TÊTE DU DOSSIER (Header gris) */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Infos Utilisateur */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                            Dossier #{request.id}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                            User : <span className="font-semibold text-slate-700">
                                {request.profiles?.full_name || request.profiles?.email || "Inconnu"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Date de création */}
                <div className="text-xs text-slate-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <Calendar size={14} className="text-slate-400"/> {createdDate}
                </div>
            </div>

            {/* 2. MESSAGE DE L'ÉTUDIANT (Si présent) */}
            {request.message && (
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex gap-3 items-start">
                    <MessageSquare size={16} className="text-amber-500 mt-1 shrink-0" />
                    <p className="text-sm text-amber-900 italic">
                        <span className="font-bold mr-1">Note étudiant :</span>
                        "{request.message}"
                    </p>
                </div>
            )}

            {/* 3. LISTE DES ARTICLES (Lignes de réservation) */}
            <div className="divide-y divide-slate-100">
                {request.reservations.map((resa) => (
                    <div key={resa.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">

                        {/* Image Produit */}
                        <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {resa.instruments?.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resa.instruments.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <Package className="text-slate-300" size={20} />
                            )}
                        </div>

                        {/* Détails (Nom, Dates, Quantité) */}
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="font-bold text-sm text-slate-800 truncate">
                                {resa.instruments?.name || "Matériel supprimé"}
                            </div>

                            <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                                    x{resa.quantity}
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                    {new Date(resa.date_debut).toLocaleDateString("fr-FR")}
                                    <span className="text-slate-300">➜</span>
                                    {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                </span>
                            </div>

                            {/* Affichage du motif si la ligne a été refusée */}
                            {resa.statut === 'refusée' && resa.message && (
                                <div className="text-xs text-red-700 mt-1.5 bg-red-50 inline-flex items-center gap-1 px-2 py-1 rounded border border-red-100">
                                    <AlertCircle size={12} />
                                    <strong>Refus :</strong> {resa.message}
                                </div>
                            )}
                        </div>

                        {/* ZONE D'ACTIONS (Boutons ou Badge) */}
                        <div className="shrink-0 mt-2 sm:mt-0 min-w-[140px] flex justify-end">

                            {resa.statut === 'en attente' ? (
                                <div className="flex items-center gap-2">

                                    {/* CAS A : Mode saisie du motif (Si on a cliqué sur Refuser) */}
                                    {rejectionId === resa.id ? (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Motif..."
                                                className="text-xs border border-red-300 bg-red-50 text-red-900 rounded px-2 py-1 w-32 outline-none focus:ring-2 focus:ring-red-500"
                                                value={reason}
                                                onChange={e => setReason(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRefuse()}
                                            />
                                            <button
                                                onClick={handleRefuse}
                                                disabled={loading}
                                                className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition shadow-sm"
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setRejectionId(null)}
                                                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                                            >
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    ) : (
                                        // CAS B : Boutons Valider / Refuser
                                        <>
                                            <button
                                                onClick={() => handleValidate(resa.id)}
                                                disabled={loading || rejectionId !== null}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
                                                title="Valider"
                                            >
                                                <Check size={14} /> Valider
                                            </button>
                                            <button
                                                onClick={() => { setRejectionId(resa.id); setReason(""); }}
                                                disabled={loading || rejectionId !== null}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                                                title="Refuser"
                                            >
                                                <X size={14} /> Refuser
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // CAS C : Déjà traité -> Affichage du Badge
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${
                                    resa.statut === 'validée'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
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