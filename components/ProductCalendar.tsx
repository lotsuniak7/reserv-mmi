"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ReservationDate = {
    start: Date;
    end: Date;
};

export default function ProductCalendar({ reservations }: { reservations: { date_debut: string; date_fin: string }[] }) {
    // Текущая дата, которую смотрим (по умолчанию сегодня)
    const [currentDate, setCurrentDate] = useState(new Date());

    // Преобразуем строки дат в объекты Date для удобства
    const ranges: ReservationDate[] = reservations.map(r => ({
        start: new Date(r.date_debut),
        end: new Date(r.date_fin)
    }));

    // Вспомогательные функции для навигации по календарю
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // День недели 1-го числа
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Сколько дней в месяце

    // Сдвигаем начало недели (чтобы понедельник был первым, если нужно, сейчас 0=Воскресенье)
    // Французский стандарт: 0=Lun, 6=Dim. Корректируем:
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    // Функция проверки: занят ли конкретный день?
    const isBooked = (day: number) => {
        const checkDate = new Date(year, month, day, 12, 0, 0); // Середина дня
        return ranges.some(range => {
            // Сбрасываем время для чистого сравнения дат
            const s = new Date(range.start); s.setHours(0,0,0,0);
            const e = new Date(range.end); e.setHours(23,59,59,999);
            return checkDate >= s && checkDate <= e;
        });
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
        <div className="bg-white rounded-xl border border-[var(--border)] p-4 w-full max-w-sm">
            {/* Шапка календаря */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded">
                    <ChevronLeft size={20} />
                </button>
                <div className="font-bold text-[var(--text-primary)] capitalize">
                    {monthNames[month]} {year}
                </div>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Сетка дней */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-[var(--text-secondary)] font-medium">
                <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-sm">
                {/* Пустые ячейки до начала месяца */}
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Дни месяца */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const busy = isBooked(day);

                    return (
                        <div
                            key={day}
                            className={`
                                h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium
                                ${busy
                                ? "bg-red-100 text-red-600 cursor-not-allowed" // Занято
                                : "text-slate-700 hover:bg-slate-100" // Свободно
                            }
                            `}
                            title={busy ? "Réservé" : "Libre"}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text-secondary)] justify-center border-t pt-3">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div> Libre
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div> Réservé
                </div>
            </div>
        </div>
    );
}