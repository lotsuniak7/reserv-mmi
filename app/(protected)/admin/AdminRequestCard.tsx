"use client";

import { updateLineStatus } from "@/app/actions";
import { useState } from "react";
import { Check, X, User, MessageSquare, Calendar } from "lucide-react";

export default function AdminRequestCard({ request }: { request: any }) {
    const [rejectionId, setRejectionId] = useState<number | null>(null);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const createdDate = new Date(request.created_at).toLocaleDateString("fr-FR", {
        day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'
    });

    async function handleValidate(id: number) {
        setLoading(true);
        await updateLineStatus(id, "validée");
        setLoading(false);
    }

    async function handleRefuse() {
        if (!rejectionId || !reason.trim()) return;
        setLoading(true);
        await updateLineStatus(rejectionId, "refusée", reason);
        setLoading(false);
        setRejectionId(null);
        setReason("");
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
            {/* ШАПКА ЗАЯВКИ */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">Dossier #{request.id}</div>
                        <div className="text-xs text-slate-500 font-mono">User: <span className="font-semibold text-slate-700">
                                {request.profiles?.full_name || request.profiles?.email || "Utilisateur inconnu"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar size={16}/> {createdDate}
                </div>
            </div>

            {/* ГЛОБАЛЬНОЕ СООБЩЕНИЕ */}
            {request.message && (
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex gap-3 items-start">
                    <MessageSquare size={16} className="text-amber-500 mt-1 shrink-0" />
                    <p className="text-sm text-amber-900 italic">"{request.message}"</p>
                </div>
            )}

            {/* СПИСОК ТОВАРОВ ВНУТРИ */}
            <div className="divide-y divide-slate-100">
                {request.reservations.map((resa: any) => (
                    <div key={resa.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition">

                        {/* Картинка */}
                        <div className="w-16 h-12 bg-slate-100 rounded border overflow-hidden shrink-0 relative">
                            {resa.instruments?.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resa.instruments.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="grid place-items-center h-full text-xs text-slate-300">IMG</div>
                            )}
                        </div>

                        {/* Инфо */}
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-slate-800">{resa.instruments?.name}</div>
                            <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded border">Qté: {resa.quantity}</span>
                                <span>{new Date(resa.date_debut).toLocaleDateString("fr-FR")} ➜ {new Date(resa.date_fin).toLocaleDateString("fr-FR")}</span>
                            </div>
                            {/* Если отказано - показать причину */}
                            {resa.statut === 'refusée' && resa.message && (
                                <div className="text-xs text-red-500 mt-1 font-medium">Motif: {resa.message}</div>
                            )}
                        </div>

                        {/* КНОПКИ ДЕЙСТВИЙ */}
                        <div className="shrink-0">
                            {resa.statut === 'en attente' ? (
                                <div className="flex items-center gap-2">
                                    {rejectionId === resa.id ? (
                                        // Поле ввода причины отказа
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                            <input
                                                autoFocus
                                                placeholder="Motif..."
                                                className="text-xs border border-red-200 rounded px-2 py-1 w-32 outline-none"
                                                value={reason}
                                                onChange={e => setReason(e.target.value)}
                                            />
                                            <button onClick={handleRefuse} className="px-2 py-1 bg-red-600 text-white text-xs rounded">OK</button>
                                            <button onClick={() => setRejectionId(null)} className="p-1 text-slate-400"><X size={14}/></button>
                                        </div>
                                    ) : (
                                        // Кнопки Валидации / Отказа
                                        <>
                                            <button
                                                onClick={() => handleValidate(resa.id)}
                                                disabled={loading || rejectionId !== null}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded hover:bg-green-100 border border-green-200"
                                            >
                                                <Check size={14} /> Valider
                                            </button>
                                            <button
                                                onClick={() => { setRejectionId(resa.id); setReason(""); }}
                                                disabled={loading || rejectionId !== null}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded hover:bg-red-100 border border-red-200"
                                            >
                                                <X size={14} /> Refuser
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // БЕЙДЖ СТАТУСА (если уже обработано)
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    resa.statut === 'validée' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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