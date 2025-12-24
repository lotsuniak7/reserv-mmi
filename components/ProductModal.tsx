"use client";

import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon, AlertCircle } from "lucide-react"; // добавили иконку AlertCircle
import ProductCalendar from "@/components/ProductCalendar";
import AddToCartButton from "@/components/AddToCartButton";
import { getInstrumentReservations } from "@/app/actions";

// ... (Типы остаются те же)
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

export default function ProductModal({ instrument, isOpen, onClose, initialDateStart, initialDateEnd }: Props) {
    const [reservations, setReservations] = useState<any[]>([]);

    // Даты
    const [startDate, setStartDate] = useState(initialDateStart);
    const [endDate, setEndDate] = useState(initialDateEnd);
    const [errorMsg, setErrorMsg] = useState(""); // Состояние для ошибки дат

    // Ограничения
    const today = new Date().toISOString().split("T")[0]; // "2024-12-25"
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    const maxLimit = nextYearDate.toISOString().split("T")[0]; // "2025-12-25"

    useEffect(() => {
        if (instrument && isOpen) {
            getInstrumentReservations(instrument.id).then(data => setReservations(data));
            setStartDate(initialDateStart);
            setEndDate(initialDateEnd);
            setErrorMsg("");
        }
    }, [instrument, isOpen, initialDateStart, initialDateEnd]);

    // Проверка валидности дат при изменении
    useEffect(() => {
        if (!startDate || !endDate) {
            setErrorMsg("");
            return;
        }
        if (startDate < today) {
            setErrorMsg("La date de début est dans le passé.");
            return;
        }
        if (endDate < startDate) {
            setErrorMsg("La date de fin doit être après le début.");
            return;
        }
        if (endDate > maxLimit) {
            setErrorMsg("Réservation limitée à 1 an.");
            return;
        }
        setErrorMsg(""); // Все ок
    }, [startDate, endDate, today, maxLimit]);


    if (!isOpen || !instrument) return null;

    // Расчет доступности (только если нет ошибок дат)
    let availableQty = instrument.quantite || 1;
    if (startDate && endDate && !errorMsg) {
        const reservedCount = reservations
            .filter(r => r.date_debut <= endDate && r.date_fin >= startDate)
            .reduce((sum, r) => sum + (r.quantity || 1), 0);
        availableQty = Math.max(0, (instrument.quantite || 1) - reservedCount);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 h-screen"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute right-4 top-4 z-10 p-2 bg-white/80 rounded-full hover:bg-slate-100 transition"><X size={20} /></button>

                {/* ЛЕВАЯ ЧАСТЬ (без изменений) */}
                <div className="w-full md:w-1/2 p-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col gap-4">
                    <div className="aspect-video bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                        {instrument.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={instrument.image_url} alt={instrument.name} className="w-full h-full object-contain" />
                        ) : <span className="text-4xl">📷</span>}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{instrument.name}</h2>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {instrument.description || "Aucune description disponible."}
                        </p>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ */}
                <div className="w-full md:w-1/2 p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-sm uppercase text-slate-400 mb-3 flex items-center gap-2">
                            <CalendarIcon size={16}/> Disponibilité
                        </h3>
                        <div className="flex justify-center border rounded-xl p-2 bg-slate-50/50">
                            <ProductCalendar reservations={reservations} />
                        </div>
                    </div>

                    {/* Выбор дат С ОГРАНИЧЕНИЯМИ */}
                    <div className={`grid grid-cols-2 gap-3 bg-white border p-3 rounded-xl shadow-sm ${errorMsg ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Début</label>
                            <input
                                type="date"
                                min={today}
                                max={maxLimit}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="text-sm font-medium outline-none text-slate-700 bg-transparent"
                            />
                        </div>
                        <div className="flex flex-col text-right">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Fin</label>
                            <input
                                type="date"
                                min={startDate || today} // Нельзя выбрать конец раньше начала
                                max={maxLimit}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="text-sm font-medium outline-none text-slate-700 bg-transparent text-right"
                            />
                        </div>
                    </div>

                    {/* Сообщения об ошибках или статусе */}
                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 font-medium">
                            <AlertCircle size={16}/> {errorMsg}
                        </div>
                    )}

                    {(!startDate || !endDate) && !errorMsg && (
                        <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg flex items-center gap-2 border border-amber-100">
                            ⚠️ Sélectionnez des dates.
                        </div>
                    )}

                    <div className="pt-2">
                        {/* Блокируем кнопку, если есть ошибка */}
                        {errorMsg ? (
                            <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg font-bold text-sm cursor-not-allowed">
                                Corrigez les dates
                            </button>
                        ) : (
                            <AddToCartButton
                                instrument={instrument}
                                availableQty={availableQty}
                                dates={startDate && endDate ? { start: startDate, end: endDate } : null}
                                onSuccess={onClose}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}