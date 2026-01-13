"use client";

import Link from "next/link";
import { useState } from "react";

// Принимаем роль как проп
export default function Sidebar({ role }: { role?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: "/catalogue", label: "Matériels" },
        { href: "/mes-reservations", label: "Mes réservations" },
        // Ссылка на админку только если роль === 'admin'
        ...(role === 'admin' ? [{ href: "/admin", label: "Administration" }] : []),
        { href: "/aide", label: "Aide / Tutoriels" },
    ];

    const sidebarContent = (
        <>
            {/* Логотип */}
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
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </>
    );

    return (
        <>
            {/* КНОПКА БУРГЕР */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-[var(--card)] border flex flex-col items-center justify-center gap-1.5 shadow-lg"
                style={{ borderColor: "var(--border)" }}
                aria-label="Toggle menu"
            >
                <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            {/* ЗАТЕМНЕНИЕ */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* МОБИЛЬНЫЙ САЙДБАР */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-60
                    p-6 border-r bg-[var(--surface)] z-45
                    flex flex-col gap-6 overflow-y-auto
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:hidden
                `}
                style={{ borderColor: "var(--border)" }}
            >
                {sidebarContent}
            </aside>

            {/* ДЕСКТОПНЫЙ САЙДБАР */}
            <aside
                className="
                    hidden md:flex md:flex-col md:w-60
                    p-6 border-r bg-[var(--surface)]
                    flex-shrink-0 overflow-y-auto gap-6
                "
                style={{ borderColor: "var(--border)" }}
            >
                {sidebarContent}
            </aside>
        </>
    );
}