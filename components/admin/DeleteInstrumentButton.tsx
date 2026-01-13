"use client";

import { deleteInstrument } from "@/app/actions";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Bouton de suppression d'un instrument (Inventaire).
 * Gère la confirmation utilisateur et l'appel au Server Action.
 */
export default function DeleteInstrumentButton({ id }: { id: number }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        // Confirmation native du navigateur
        if (!confirm("Voulez-vous vraiment supprimer cet objet de l'inventaire ? Cette action est irréversible.")) {
            return;
        }

        setLoading(true);
        // Appel au Server Action pour supprimer en base
        await deleteInstrument(id);
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Supprimer définitivement"
            aria-label="Supprimer"
        >
            {loading ? (
                // Icône de chargement animée
                <Loader2 size={18} className="animate-spin text-slate-500" />
            ) : (
                // Icône Poubelle
                <Trash2 size={18} />
            )}
        </button>
    );
}