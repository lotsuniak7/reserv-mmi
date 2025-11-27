"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={"bg-green-500"}>
            {/* Menu burger pour téléphone */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[70] md:hidden w-10 h-10 rounded-lg bg-[var(--card)] border flex flex-col items-center justify-center gap-1.5 shadow-lg"
                style={{ borderColor: "var(--border)" }}
                aria-label="Toggle menu"
            >
                <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            {/* Затемнение на мобилке */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[65] md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen
                    p-6 border-r 
                    bg-[var(--surface)]
                    z-[68]
                    flex flex-col gap-6
                    overflow-y-auto
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
                style={{
                    borderColor: "var(--border)",
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <div
                        className="w-10 h-10 rounded-xl grid place-items-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                    >
                        MMI
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-sm">MMI Dijon</div>
                        <div className="text-xs opacity-70">Réservation Matériel</div>
                    </div>
                </div>

                {/* Навигация */}
                <nav className="flex flex-col gap-2 text-sm">
                    <Link
                        href="/materiels"
                        className="px-3 py-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Matériels
                    </Link>
                    <Link
                        href="/mes-reservations"
                        className="px-3 py-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Mes réservations
                    </Link>
                    <Link
                        href="/admin"
                        className="px-3 py-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Administration
                    </Link>
                    <Link
                        href="/aide"
                        className="px-3 py-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Aide / Tutoriels
                    </Link>
                </nav>
            </aside>
        </div>
    );
}