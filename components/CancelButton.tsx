// components/CancelButton.tsx
"use client";

import { cancelReservation } from "@/app/actions";
import { useState } from "react";

export default function CancelButton({ reservationId }: { reservationId: number }) {
    const [loading, setLoading] = useState(false);

    async function handleCancel() {
        if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

        setLoading(true);
        await cancelReservation(reservationId);
        setLoading(false);
    }

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
        >
            {loading ? "..." : "Annuler"}
        </button>
    );
}