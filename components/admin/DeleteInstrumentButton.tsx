"use client";

import { deleteInstrument } from "@/app/actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteInstrumentButton({ id }: { id: number }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Supprimer définitivement ce matériel ?")) return;
        setLoading(true);
        await deleteInstrument(id);
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
            title="Supprimer"
        >
            {loading ? <span className="text-xs">...</span> : <Trash2 size={18} />}
        </button>
    );
}