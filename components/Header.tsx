"use client";

import { useCart } from "@/lib/cart-context";
import { signOut } from "@/app/actions";
import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Client Supabase pour récupérer le nom

/**
 * En-tête (Header).
 * Version épurée : Sert uniquement de barre d'outils (Panier, Profil).
 * Le titre de la page est géré individuellement par chaque page (<h1>).
 */
export default function Header() {
    const { cart } = useCart();
    const [userName, setUserName] = useState<string>("Utilisateur");

    // On récupère le nom de l'utilisateur côté client pour l'afficher
    useEffect(() => {
        const getUserName = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // On essaie de prendre le nom complet, sinon l'email
                setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Étudiant");
            }
        };
        getUserName();
    }, []);

    return (
        <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">

            {/* GAUCHE : Salutation (Remplace le titre dupliqué) */}
            <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Espace connecté</span>
                <h2 className="text-lg font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                    Bonjour, <span className="text-indigo-600">{userName}</span>
                </h2>
            </div>

            {/* DROITE : Actions (Panier & Logout) */}
            <div className="flex items-center gap-6">

                {/* 1. Panier (Avec Badge) */}
                <Link
                    href="/panier"
                    className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition group"
                    title="Voir mon panier"
                >
                    <ShoppingBag size={24} strokeWidth={2} />

                    {/* Badge rouge animé */}
                    {cart.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                            {cart.length}
                        </span>
                    )}
                </Link>

                {/* Séparateur */}
                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                {/* 2. Profil & Déconnexion */}
                <div className="flex items-center gap-4">
                    {/* Avatar visuel */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                            <User size={20} />
                        </div>
                    </div>

                    {/* Bouton Logout */}
                    <div className="pl-2">
                        <LogoutButton action={signOut} minimal={true} />
                    </div>
                </div>
            </div>
        </header>
    );
}