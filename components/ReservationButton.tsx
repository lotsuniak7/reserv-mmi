// components/ReservationButton.tsx
"use client";

import { useState } from "react";
import { createReservation } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ReservationButton({ instrumentId, instrumentName }: { instrumentId: number, instrumentName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // Добавляем ID инструмента в форму скрыто
        formData.append("instrument_id", instrumentId.toString());

        const result = await createReservation(formData);
        setLoading(false);

        if (result?.error) {
            alert(result.error);
        } else {
            setIsOpen(false);
            // Перенаправляем пользователя на список его броней
            router.push("/mes-reservations");
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition font-medium"
                style={{ background: "var(--primary)" }}
            >
                Réserver
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <form action={handleSubmit} className="bg-[var(--card)] p-6 rounded-xl shadow-2xl w-full max-w-md space-y-4 border border-[var(--border)]">
                <h3 className="text-lg font-bold">Réserver : {instrumentName}</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Début</label>
                        <input type="date" name="date_debut" required className="w-full border rounded-md px-3 py-2 bg-[var(--background)]" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Fin</label>
                        <input type="date" name="date_fin" required className="w-full border rounded-md px-3 py-2 bg-[var(--background)]" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Message (optionnel)</label>
                    <textarea name="message" rows={3} placeholder="Raison, projet..." className="w-full border rounded-md px-3 py-2 bg-[var(--background)]"></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-4 py-2 rounded-lg border hover:bg-slate-50 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-lg text-white transition hover:opacity-90 disabled:opacity-50"
                        style={{ background: "var(--primary)" }}
                    >
                        {loading ? "..." : "Confirmer"}
                    </button>
                </div>
            </form>
        </div>
    );
}