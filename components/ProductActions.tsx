"use client";

import { useState } from "react";
import ProductCalendar from "@/components/ProductCalendar";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductActions({
                                           instrument,
                                           reservations,
                                           totalQty,
                                           initialStart = "",
                                           initialEnd = ""
                                       }: {
    instrument: any,
    reservations: any[],
    totalQty: number,
    initialStart?: string,
    initialEnd?: string
}) {
    // Сразу используем переданные даты как начальное состояние
    const [startDate, setStartDate] = useState(initialStart);
    const [endDate, setEndDate] = useState(initialEnd);

    // --- ЛОГИКА ПОДСЧЕТА ДОСТУПНОСТИ ---
    let availableQty = totalQty;

    if (startDate && endDate) {
        // Ищем брони, которые пересекаются с выбранным периодом
        const reservedCount = reservations
            .filter(r => {
                // (StartA <= EndB) and (EndA >= StartB)
                return r.date_debut <= endDate && r.date_fin >= startDate;
            })
            // Суммируем количество занятых штук (если поля quantity нет, считаем как 1)
            .reduce((sum, r) => sum + (r.quantity || 1), 0);

        availableQty = Math.max(0, totalQty - reservedCount);
    }
    // -----------------------------------

    // Ограничения для инпутов (Сегодня ... Сегодня + 1 год)
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const maxDate = nextYear.toISOString().split("T")[0];

    return (
        <div className="card p-6 bg-white border-2 border-slate-100 shadow-sm space-y-6 sticky top-6">
            <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📅</span> Disponibilité
                </h3>

                {/* Календарь для визуализации занятости */}
                <ProductCalendar reservations={reservations} />

                {/* Инпуты для выбора дат */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Début</label>
                        <input
                            type="date"
                            min={today}
                            max={maxDate}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fin</label>
                        <input
                            type="date"
                            min={startDate || today}
                            max={maxDate}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                {/* Наша новая кнопка */}
                <AddToCartButton
                    instrument={instrument}
                    availableQty={availableQty}
                    dates={startDate && endDate ? { start: startDate, end: endDate } : null}
                />

                <p className="text-xs text-center text-slate-400 mt-4 leading-snug">
                    Le matériel est ajouté à votre panier temporaire.<br/>
                    Vous pourrez confirmer la demande ensuite.
                </p>
            </div>
        </div>
    );
}