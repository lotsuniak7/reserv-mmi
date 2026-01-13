"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, Calendar, HelpCircle, ShieldCheck, Menu, X } from "lucide-react";

/**
 * Barre latérale de navigation (Sidebar).
 * S'adapte au rôle de l'utilisateur (Admin ou Étudiant).
 * Gère l'état actif des liens et le mode responsive (mobile).
 */
export default function Sidebar({ role }: { role?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname(); // Permet de savoir sur quelle page on est

    // Définition des liens de navigation
    const navLinks = [
        {
            href: "/catalogue",
            label: "Catalogue",
            icon: Package
        },
        {
            href: "/mes-reservations",
            label: "Mes Réservations",
            icon: Calendar
        },
        // Lien Admin : visible uniquement si rôle = admin
        ...(role === 'admin' ? [{
            href: "/admin",
            label: "Administration",
            icon: ShieldCheck
        }] : []),
        {
            href: "/aide",
            label: "Aide & Tutoriels",
            icon: HelpCircle
        },
    ];

    // Contenu commun (Logo + Liens)
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* 1. LOGO */}
            <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                    MMI
                </div>
                <div>
                    <div className="font-bold text-slate-800 leading-tight">MMI Dijon</div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Réservations</div>
                </div>
            </div>

            {/* 2. NAVIGATION */}
            <nav className="flex-1 space-y-1">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)} // Ferme le menu sur mobile au clic
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive
                                ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100" // Style Actif
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900" // Style Inactif
                            }
                            `}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* 3. FOOTER (Logout ira ici plus tard) */}
            <div className="mt-auto pt-6 border-t border-slate-200">
                {/* Ici tu pourras mettre <LogoutButton /> quand tu l'auras fini */}
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
                    © 2026 IUT Dijon
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* --- BOUTON BURGER (Mobile uniquement) --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-lg bg-white border border-slate-200 shadow-md text-slate-600 active:scale-95 transition"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* --- OVERLAY (Fond noir transparent sur mobile) --- */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* --- SIDEBAR MOBILE --- */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 shadow-2xl md:hidden
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {sidebarContent}
            </aside>

            {/* --- SIDEBAR DESKTOP --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
                {sidebarContent}
            </aside>
        </>
    );
}