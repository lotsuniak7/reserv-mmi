"use client";

import { updateReservationStatus } from "@/app/actions";
import { useState } from "react";
import { Check, X, AlertCircle } from "lucide-react"; // Используем иконки, если они есть (из lucide-react)
// Если lucide-react не установлен, просто удалите импорты иконок и используйте текст "V" / "X"

export default function AdminReservationRow({ reservation }: { reservation: any }) {
    const [loading, setLoading] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState("");

    // Форматирование дат
    const start = new Date(reservation.date_debut).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' });
    const end = new Date(reservation.date_fin).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' });

    async function handleValidate() {
        if (!confirm("Confirmer la réservation ?")) return;
        setLoading(true);
        await updateReservationStatus(reservation.id, 'validée');
        setLoading(false);
    }

    async function submitRejection() {
        if (!reason.trim()) return alert("Le motif est obligatoire pour refuser.");

        setLoading(true);
        await updateReservationStatus(reservation.id, 'refusée', reason);
        setLoading(false);
        setIsRejecting(false);
    }

    // Стили бейджей (увеличены шрифты и паддинги)
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
                    {/* Крупная миниатюра */}
                    <div className="w-16 h-16 rounded-lg bg-slate-200 border border-slate-300 flex-shrink-0 overflow-hidden relative shadow-sm">
                        {reservation.instruments?.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={reservation.instruments.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-slate-400">📷</div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="font-bold text-[var(--text-primary)] text-base leading-snug">
                            {reservation.instruments?.name || "Matériel inconnu"}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            <span className="font-mono text-slate-500">
                                {reservation.user_id.slice(0, 8)}...
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            {/* 2. Даты */}
            <td className="px-6 py-5 align-middle">
                <div className="inline-flex flex-col bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Période</span>
                    <span className="text-sm font-medium text-slate-700">
                        {start} — {end}
                    </span>
                </div>
            </td>

            {/* 3. Сообщение */}
            <td className="px-6 py-5 align-middle">
                {reservation.message ? (
                    <div className="relative group/msg cursor-help">
                        <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md border border-slate-200 max-w-[200px] truncate italic">
                            "{reservation.message}"
                        </div>
                        {/* Тултип при наведении на длинное сообщение */}
                        <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded shadow-lg hidden group-hover/msg:block z-10">
                            {reservation.message}
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-300 text-2xl select-none">—</span>
                )}
            </td>

            {/* 4. Статус */}
            <td className="px-6 py-5 align-middle">
                <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ring-1 ring-inset shadow-sm capitalize
                    ${statusBadges[reservation.statut] || "bg-gray-50 border-gray-200 text-gray-500"}
                `}>
                    {reservation.statut}
                </span>
            </td>

            {/* 5. Действия */}
            <td className="px-6 py-5 align-middle text-right">
                {reservation.statut === 'en attente' && !isRejecting && (
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleValidate}
                            disabled={loading}
                            title="Valider"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 transition active:scale-95"
                        >
                            <Check size={18} strokeWidth={3} /> {/* Или просто "V" */}
                        </button>
                        <button
                            onClick={() => setIsRejecting(true)}
                            disabled={loading}
                            title="Refuser"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 transition active:scale-95"
                        >
                            <X size={18} strokeWidth={3} /> {/* Или просто "X" */}
                        </button>
                    </div>
                )}

                {/* ИНТЕРФЕЙС ОТКАЗА С ПРИЧИНОЙ */}
                {isRejecting && (
                    <div className="absolute right-4 mt-[-20px] w-[300px] z-20 bg-white p-4 rounded-xl shadow-xl border border-red-100 animate-in slide-in-from-right-5 fade-in duration-200">
                        <h4 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-2">
                            <AlertCircle size={14}/> Motif du refus
                        </h4>
                        <textarea
                            autoFocus
                            placeholder="Ex: Matériel indisponible..."
                            className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-red-200 outline-none bg-red-50/50 resize-none"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => setIsRejecting(false)}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={loading}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-md transition"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
}