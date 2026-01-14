"use client";

import { cancelReservation } from "@/app/actions";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Bouton d'annulation GLOBAL (CancelRequestButton).
 * Permet d'annuler une ou plusieurs réservations d'un coup.
 * Actualise la page après l'opération.
 */
export default function CancelRequestButton({ reservationIds }: { reservationIds: number[] }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleCancel() {
        const count = reservationIds.length;
        if (!confirm(`Voulez-vous vraiment annuler cette demande (${count} article${count > 1 ? 's' : ''}) ?`)) return;

        setLoading(true);

        try {
            // Exécution des suppressions en parallèle
            await Promise.all(reservationIds.map((id) => cancelReservation(id)));

            // Force le rafraîchissement des données de la page
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'annulation. Vérifiez vos droits.");
        } finally {
            setLoading(false);
        }
    }

    if (reservationIds.length === 0) return null;

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Trash2 size={16} />
            )}
            Annuler la demande complète
        </button>
    );
}