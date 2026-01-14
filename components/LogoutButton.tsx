"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
    action: () => Promise<void>;
    minimal?: boolean;
};

/**
 * Bouton de déconnexion.
 * Supporte deux modes :
 * - Normal (Texte + Icône) pour les menus.
 * - Minimal (Icône seule) pour le Header.
 */
export default function LogoutButton({ action, minimal = false }: Props) {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await action();
        } catch (error) {
            console.error("Erreur déconnexion", error);
            setLoading(false);
        }
    };

    // MODE MINIMAL (Juste l'icône, pour le Header)
    if (minimal) {
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition duration-200"
                title="Se déconnecter"
            >
                {loading ? (
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                ) : (
                    <LogOut size={20} strokeWidth={2} />
                )}
            </button>
        );
    }

    // MODE NORMAL (Texte + Icône, par défaut)
    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition w-full"
        >
            {loading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <LogOut size={18} />
            )}
            <span>{loading ? "Déconnexion..." : "Se déconnecter"}</span>
        </button>
    );
}