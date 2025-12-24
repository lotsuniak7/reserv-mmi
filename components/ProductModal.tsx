"use client";

import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import ProductCalendar from "@/components/ProductCalendar";
import AddToCartButton from "@/components/AddToCartButton";
import { getInstrumentReservations } from "@/app/actions";

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

    const [startDate, setStartDate] = useState(initialDateStart);
    const [endDate, setEndDate] = useState(initialDateEnd);

    useEffect(() => {
        if (instrument && isOpen) {
            getInstrumentReservations(instrument.id).then(data => setReservations(data));
            setStartDate(initialDateStart);
            setEndDate(initialDateEnd);
        }
    }, [instrument, isOpen, initialDateStart, initialDateEnd]);

    if (!isOpen || !instrument) return null;

    let availableQty = instrument.quantite || 1;
    if (startDate && endDate) {
        const reservedCount = reservations
            .filter(r => r.date_debut <= endDate && r.date_fin >= startDate)
            .reduce((sum, r) => sum + (r.quantity || 1), 0);
        availableQty = Math.max(0, (instrument.quantite || 1) - reservedCount);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 h-screen"
            onClick={onClose} // <--- 1. ЗАКРЫВАЕМ ПРИ КЛИКЕ НА ФОН
        >
            {/* Контейнер окна */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()} // <--- 2. БЛОКИРУЕМ ЗАКРЫТИЕ, ЕСЛИ КЛИКНУЛИ ВНУТРИ
            >

                {/* Кнопка закрытия */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 p-2 bg-white/80 rounded-full hover:bg-slate-100 transition"
                >
                    <X size={20} />
                </button>

                {/* ЛЕВАЯ ЧАСТЬ: Картинка и Инфо */}
                <div className="w-full md:w-1/2 p-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col gap-4">
                    <div className="aspect-video bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                        {instrument.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={instrument.image_url} alt={instrument.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-4xl">📷</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{instrument.name}</h2>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {instrument.description || "Aucune description disponible."}
                        </p>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Календарь и Действия */}
                <div className="w-full md:w-1/2 p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-sm uppercase text-slate-400 mb-3 flex items-center gap-2">
                            <CalendarIcon size={16}/> Disponibilité
                        </h3>
                        {/* Календарь */}
                        <div className="flex justify-center">
                            <ProductCalendar reservations={reservations} />
                        </div>
                    </div>

                    {/* Выбор дат */}
                    <div className="grid grid-cols-2 gap-3 bg-white border p-3 rounded-xl shadow-sm">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Début</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm font-medium outline-none"/>
                        </div>
                        <div className="flex flex-col text-right">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Fin</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm font-medium outline-none text-right"/>
                        </div>
                    </div>

                    {/* Кнопка действия */}
                    <AddToCartButton
                        instrument={instrument}
                        availableQty={availableQty}
                        dates={startDate && endDate ? { start: startDate, end: endDate } : null}
                        onSuccess={onClose}
                    />
                </div>
            </div>
        </div>
    );
}