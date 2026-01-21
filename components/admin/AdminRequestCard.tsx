"use client";

import { updateRequestStatus } from "@/app/actions";
import { useState } from "react";
import { Check, X, User, MessageSquare, Package, FileText, Printer, Phone, GraduationCap, XCircle } from "lucide-react";

// --- TYPES ---
type ReservationItem = {
    id: number;
    quantity: number;
    date_debut: string;
    date_fin: string;
    start_time: string | null;
    end_time: string | null;
    statut: string;
    message?: string;
    instruments: { name: string; image_url: string | null; } | null;
};

type RequestWithDetails = {
    id: number;
    created_at: string;
    statut: string;
    message: string | null;
    enseignant?: string;
    project_type?: string;
    profiles: {
        full_name: string | null;
        email: string | null;
        phone?: string;
        filiere?: string;
        parcours?: string;
    } | null;
    reservations: ReservationItem[];
};

/**
 * Carte de gestion globale d'un dossier.
 * Les actions (Valider/Refuser) s'appliquent désormais à TOUT le dossier.
 */
export default function AdminRequestCard({ request }: { request: RequestWithDetails }) {
    const [currentStatus, setCurrentStatus] = useState(request.statut);

    // États pour le refus global
    const [isRejecting, setIsRejecting] = useState(false); // Affiche la zone de texte refus
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    // État pour le Bon de Sortie
    const [isModalOpen, setIsModalOpen] = useState(false);

    const createdDate = new Date(request.created_at).toLocaleDateString("fr-FR", {
        day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'
    });

    // --- ACTIONS GLOBALES ---

    async function handleGlobalValidate() {
        if (!confirm("Valider l'ensemble de ce dossier ?")) return;
        setLoading(true);
        try {
            await updateRequestStatus(request.id, "validée");
            setCurrentStatus("validée");
        } catch (e) {
            alert("Erreur technique lors de la validation.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGlobalRefuse() {
        if (!reason.trim()) {
            alert("Veuillez indiquer un motif de refus pour l'étudiant.");
            return;
        }
        setLoading(true);
        try {
            await updateRequestStatus(request.id, "refusée", reason);
            setCurrentStatus("refusée");
            setIsRejecting(false);
        } catch (e) {
            alert("Erreur technique lors du refus.");
        } finally {
            setLoading(false);
        }
    }

    const handlePrint = () => {
        window.print();
    };

    // Détermine la couleur de la bordure selon le statut global
    const statusColor =
        request.statut === 'validée' ? 'border-emerald-500' :
            request.statut === 'refusée' ? 'border-red-200 opacity-75' :
                'border-slate-200';

    return (
        <>
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-modal, #printable-modal * { visibility: visible; }
                    #printable-modal { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; z-index: 9999; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className={`bg-white border rounded-xl shadow-sm overflow-hidden mb-8 transition hover:shadow-md ${statusColor}`}>

                {/* --- HEADER --- */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 ${
                            currentStatus === 'validée' ? 'bg-emerald-100 text-emerald-600' :
                                currentStatus === 'refusée' ? 'bg-red-100 text-red-600' :
                                    'bg-indigo-100 text-indigo-600'
                        }`}>
                            {currentStatus === 'validée' ? <Check size={20}/> :
                                currentStatus === 'refusée' ? <X size={20}/> :
                                    <User size={20}/>}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                Dossier #{request.id}
                                {request.enseignant && (
                                    <span className="text-[10px] font-normal bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 hidden sm:inline-block">
                                        Prof: {request.enseignant}
                                    </span>
                                )}
                                {/* Badge de Statut Global */}
                                {currentStatus !== 'en attente' && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                                        currentStatus === 'validée' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {currentStatus}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                                User : <span className="font-semibold text-slate-700">
                                    {request.profiles?.full_name || "Inconnu"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
                        >
                            <FileText size={14} />
                            Bon de sortie
                        </button>
                        <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hidden sm:block">
                            {createdDate}
                        </div>
                    </div>
                </div>

                {/* Message étudiant */}
                {request.message && (
                    <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex gap-3 items-start">
                        <MessageSquare size={16} className="text-amber-500 mt-1 shrink-0" />
                        <p className="text-sm text-amber-900 italic">"{request.message}"</p>
                    </div>
                )}

                {/* --- LISTE DES ARTICLES (Lecture seule) --- */}
                <div className="divide-y divide-slate-100">
                    {request.reservations.map((resa) => (
                        <div key={resa.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/30">
                            <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {resa.instruments?.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={resa.instruments.image_url} className="w-full h-full object-cover" alt="" />
                                ) : <Package className="text-slate-300" size={20} />}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="font-bold text-sm text-slate-800 truncate">
                                    {resa.instruments?.name || "Matériel supprimé"}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-600">x{resa.quantity}</span>
                                    <span className="flex items-center gap-1">
                                        {new Date(resa.date_debut).toLocaleDateString("fr-FR")}
                                        <span className="font-bold text-slate-700">({resa.start_time || "09:00"})</span>
                                        <span className="text-slate-300">➜</span>
                                        {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                        <span className="font-bold text-slate-700">({resa.end_time || "17:00"})</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- FOOTER D'ACTIONS GLOBALES --- */}
                {/* On n'affiche les boutons que si le dossier est "en attente" */}
                {currentStatus === 'en attente' && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200">

                        {!isRejecting ? (
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsRejecting(true)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition shadow-sm"
                                >
                                    <XCircle size={18} />
                                    Refuser le dossier
                                </button>
                                <button
                                    onClick={handleGlobalValidate}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition shadow-md shadow-slate-900/10"
                                >
                                    {loading ? <span className="animate-spin">⏳</span> : <Check size={18} />}
                                    Valider le dossier
                                </button>
                            </div>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-bottom-2 fade-in">
                                <label className="block text-xs font-bold text-red-700 uppercase mb-2">Motif du refus (Obligatoire)</label>
                                <div className="flex gap-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Ex: Période trop longue, matériel réservé pour examen..."
                                        className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleGlobalRefuse()}
                                    />
                                    <button
                                        onClick={handleGlobalRefuse}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition"
                                    >
                                        Confirmer le refus
                                    </button>
                                    <button
                                        onClick={() => { setIsRejecting(false); setReason(""); }}
                                        className="px-4 py-2 bg-white text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 border border-slate-200 transition"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- MODAL BON DE SORTIE (Identique mais réaffiché pour le contexte) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                    <div id="printable-modal" className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden relative animate-in zoom-in-95">
                        {/* Toolbar */}
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center no-print">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText size={20} /> Bon de Sortie #{request.id}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm transition">
                                    <Printer size={16} /> Imprimer / PDF
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Document Papier */}
                        <div className="p-8 text-slate-900 space-y-6">
                            <div className="flex justify-between border-b-2 border-slate-900 pb-4">
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-widest">Bon de Sortie</h1>
                                    <p className="text-sm font-bold text-slate-500">Département MMI - Dijon</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Créé le {new Date(request.created_at).toLocaleDateString("fr-FR")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h4 className="font-bold uppercase text-xs text-slate-500 border-b border-slate-200 pb-1 mb-2">Étudiant</h4>
                                    <p className="font-bold text-lg">{request.profiles?.full_name}</p>
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Phone size={14}/> {request.profiles?.phone || "Non renseigné"}</p>
                                        <p className="flex items-center gap-2"><GraduationCap size={14}/> {request.profiles?.filiere || "—"} / {request.profiles?.parcours || "—"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold uppercase text-xs text-slate-500 border-b border-slate-200 pb-1 mb-2">Projet</h4>
                                    <div className="text-sm space-y-2">
                                        <div><span className="font-bold text-slate-700">Type :</span> {request.project_type || "Non spécifié"}</div>
                                        <div><span className="font-bold text-slate-700">Enseignant :</span> {request.enseignant || "—"}</div>
                                        {request.message && (
                                            <div className="mt-2 text-slate-500 italic text-xs border-l-2 border-slate-300 pl-2">{request.message}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold uppercase text-xs text-slate-500 mb-3">Matériel</h4>
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                    <tr className="bg-slate-100 text-slate-700 text-left">
                                        <th className="p-3 border border-slate-300">Désignation</th>
                                        <th className="p-3 border border-slate-300 w-16 text-center">Qté</th>
                                        <th className="p-3 border border-slate-300 w-32">Départ</th>
                                        <th className="p-3 border border-slate-300 w-32">Retour</th>
                                        <th className="p-3 border border-slate-300 w-24 text-center">Check</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {request.reservations.map(r => (
                                        <tr key={r.id}>
                                            <td className="p-3 border border-slate-300 font-bold">{r.instruments?.name}</td>
                                            <td className="p-3 border border-slate-300 text-center font-mono">{r.quantity}</td>
                                            <td className="p-3 border border-slate-300">
                                                {new Date(r.date_debut).toLocaleDateString("fr-FR")} <span className="text-xs block font-bold">{r.start_time}</span>
                                            </td>
                                            <td className="p-3 border border-slate-300">
                                                {new Date(r.date_fin).toLocaleDateString("fr-FR")} <span className="text-xs block font-bold">{r.end_time}</span>
                                            </td>
                                            <td className="p-3 border border-slate-300"></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t-2 border-slate-900 break-inside-avoid">
                                <div className="h-32 border border-slate-300 p-3 rounded bg-slate-50">
                                    <p className="font-bold text-xs uppercase text-slate-500 mb-12">Signature Étudiant</p>
                                </div>
                                <div className="h-32 border border-slate-300 p-3 rounded bg-slate-50">
                                    <p className="font-bold text-xs uppercase text-slate-500">Signature Secrétariat</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}