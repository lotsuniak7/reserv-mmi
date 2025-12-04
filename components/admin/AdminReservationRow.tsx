"use client";

import { updateReservationStatus } from "@/app/actions";
import { useState } from "react";
import { Check, X, AlertCircle, Camera } from "lucide-react";

export default function AdminReservationRow({ reservation }: { reservation: any }) {
    const [loading, setLoading] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState("");

    const start = new Date(reservation.date_debut).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' });
    const end = new Date(reservation.date_fin).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' });

    async function handleValidate() {
        if (!confirm("Confirmer la réservation ?")) return;
        setLoading(true);
        await updateReservationStatus(reservation.id, 'validée');
        setLoading(false);
    }

    async function submitRejection() {
        if (!reason.trim()) return alert("Le motif est obligatoire.");
        setLoading(true);
        await updateReservationStatus(reservation.id, 'refusée', reason);
        setLoading(false);
        setIsRejecting(false);
    }

    const statusBadges: Record<string, string> = {
        "en attente": "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
        "validée": "bg-green-50 text-green-700 border-green-200 ring-green-100",
        "refusée": "bg-red-50 text-red-700 border-red-200 ring-red-100",
    };

    return (
        <tr className="group hover:bg-slate-50/80 transition-colors">
            {/* 1. Товар и Пользователь */}
            <td className="px-6 py-5 align-top">
                <div className="flex gap-4">
                    {/* КАРТИНКА */}
                    <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex-shrink-0 overflow-hidden relative shadow-sm grid place-items-center">
                        {reservation.instruments?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={reservation.instruments.image_url}
                                className="w-full h-full object-cover"
                                alt="Instrument"
                            />
                        ) : (
                            // ЗАГЛУШКА ЕСЛИ НЕТ КАРТИНКИ
                            <Camera className="text-slate-300" size={24} />
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="font-bold text-[var(--text-primary)] text-sm leading-snug">
                            {reservation.instruments?.name || "Matériel inconnu"}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5 font-mono">
                            User: {reservation.user_id.slice(0, 8)}...
                        </div>
                    </div>
                </div>
            </td>

            {/* 2. Даты */}
            <td className="px-6 py-5 align-middle">
                <div className="text-sm text-slate-700">
                    <div className="font-medium">{start}</div>
                    <div className="text-xs text-slate-400">au</div>
                    <div className="font-medium">{end}</div>
                </div>
            </td>

            {/* 3. Сообщение */}
            <td className="px-6 py-5 align-middle">
                {reservation.message ? (
                    <div className="text-sm text-slate-600 italic max-w-[200px] truncate" title={reservation.message}>
                        "{reservation.message}"
                    </div>
                ) : (
                    <span className="text-slate-300 text-lg">—</span>
                )}
            </td>

            {/* 4. Статус */}
            <td className="px-6 py-5 align-middle">
                <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset capitalize
                    ${statusBadges[reservation.statut] || "bg-gray-50 border-gray-200 text-gray-500"}
                `}>
                    {reservation.statut}
                </span>
            </td>

            {/* 5. Действия */}
            <td className="px-6 py-5 align-middle text-right relative">
                {reservation.statut === 'en attente' && !isRejecting && (
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleValidate}
                            disabled={loading}
                            className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 hover:scale-110 transition"
                            title="Valider"
                        >
                            <Check size={16} strokeWidth={3} />
                        </button>
                        <button
                            onClick={() => setIsRejecting(true)}
                            disabled={loading}
                            className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 hover:scale-110 transition"
                            title="Refuser"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    </div>
                )}

                {/* ОКНО ОТКАЗА */}
                {isRejecting && (
                    <div className="absolute right-0 top-0 z-10 w-64 bg-white p-3 rounded-lg shadow-xl border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-red-600 uppercase">
                            <AlertCircle size={12}/> Motif du refus
                        </div>
                        <textarea
                            autoFocus
                            className="w-full text-xs p-2 border rounded bg-red-50/30 focus:ring-2 focus:ring-red-100 outline-none resize-none"
                            rows={2}
                            placeholder="Ex: Indisponible..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setIsRejecting(false)}
                                className="flex-1 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded hover:bg-slate-200"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={loading}
                                className="flex-1 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                            >
                                Refuser
                            </button>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
}