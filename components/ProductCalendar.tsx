"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ReservationDate = {
    start: Date;
    end: Date;
};

/**
 * Composant Calendrier (Visualisation).
 * Affiche les disponibilités d'un instrument mois par mois.
 * Les jours réservés apparaissent en rouge.
 */
export default function ProductCalendar({ reservations }: { reservations: { date_debut: string; date_fin: string }[] }) {
    // Date affichée actuellement (Mois/Année)
    const [currentDate, setCurrentDate] = useState(new Date());

    // Conversion des dates de string vers Date
    const ranges: ReservationDate[] = reservations.map(r => ({
        start: new Date(r.date_debut),
        end: new Date(r.date_fin)
    }));

    // Calculs pour l'affichage du mois
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 = Janvier

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Jour de la semaine du 1er
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Nombre de jours total

    // Ajustement pour que la semaine commence le Lundi (0=Dimanche en JS)
    // 0(Dim) -> 6, 1(Lun) -> 0, etc.
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    // Vérifie si un jour précis est occupé
    const isBooked = (day: number) => {
        // On place le curseur à midi pour éviter les soucis de fuseau horaire
        const checkDate = new Date(year, month, day, 12, 0, 0);

        return ranges.some(range => {
            // Normalisation des dates pour comparer sans l'heure
            const s = new Date(range.start); s.setHours(0,0,0,0);
            const e = new Date(range.end); e.setHours(23,59,59,999);
            return checkDate >= s && checkDate <= e;
        });
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
        <div className="bg-white w-full max-w-sm">

            {/* 1. En-tête (Mois + Navigation) */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="font-bold text-slate-800 capitalize text-sm">
                    {monthNames[month]} {year}
                </div>
                <button
                    onClick={() => changeMonth(1)}
                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* 2. Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-slate-400 mb-2">
                <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
            </div>

            {/* 3. Grille des jours */}
            <div className="grid grid-cols-7 gap-1 text-sm">
                {/* Cases vides avant le 1er du mois */}
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Jours du mois */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const busy = isBooked(day);

                    // Vérification si c'est aujourd'hui (optionnel, pour le style)
                    const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === month &&
                        new Date().getFullYear() === year;

                    return (
                        <div
                            key={day}
                            className={`
                                h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors
                                ${busy
                                ? "bg-red-50 text-red-500 cursor-not-allowed border border-red-100" // Occupé
                                : isToday
                                    ? "bg-indigo-600 text-white font-bold shadow-md" // Aujourd'hui
                                    : "text-slate-600 hover:bg-slate-100 cursor-default" // Libre
                            }
                            `}
                            title={busy ? "Indisponible" : "Libre"}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            {/* 4. Légende */}
            <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-400 justify-center border-t border-slate-100 pt-3 uppercase font-bold tracking-wider">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div> Libre
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div> Réservé
                </div>
            </div>
        </div>
    );
}