"use client";

import { useState, useEffect } from "react";
import { createReservation } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ReservationButton({ instrumentId, instrumentName }: { instrumentId: number, instrumentName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Вычисляем даты для ограничений (min и max)
    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");

    useEffect(() => {
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);

        // Формат YYYY-MM-DD для инпута
        setMinDate(today.toISOString().split('T')[0]);
        setMaxDate(nextYear.toISOString().split('T')[0]);
    }, []);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append("instrument_id", instrumentId.toString());

        const result = await createReservation(formData);
        setLoading(false);

        if (result?.error) {
            alert(result.error);
        } else {
            setIsOpen(false);
            router.push("/mes-reservations");
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full px-6 py-3 rounded-lg text-white font-medium shadow-md hover:opacity-90 transition transform active:scale-95"
                style={{ background: "var(--primary)" }}
            >
                Réserver
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md space-y-5 border border-slate-200">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800">Réserver</h3>
                    <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                    <span className="text-sm text-slate-500 block uppercase text-[10px] font-bold tracking-wider">Matériel</span>
                    <span className="font-semibold text-slate-900">{instrumentName}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Début</label>
                        <input
                            type="date"
                            name="date_debut"
                            required
                            min={minDate} // Нельзя выбрать прошедшее
                            max={maxDate} // Нельзя выбрать > 1 года (и ввести 5 цифр года)
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Fin</label>
                        <input
                            type="date"
                            name="date_fin"
                            required
                            min={minDate}
                            max={maxDate}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Message (optionnel)</label>
                    <textarea
                        name="message"
                        rows={3}
                        placeholder="Projet, contexte..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none"
                    ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg text-white transition hover:opacity-90 disabled:opacity-70 font-medium text-sm shadow-sm"
                        style={{ background: "var(--primary)" }}
                    >
                        {loading ? "Envoi..." : "Confirmer"}
                    </button>
                </div>
            </form>
        </div>
    );
}