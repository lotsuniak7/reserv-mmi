"use client";

import { approveUser, rejectUser } from "@/app/actions";
import { useState } from "react";
import { Check, XCircle, Trash2, Loader2 } from "lucide-react";

type UserActionsProps = {
    userId: string;
    userEmail: string;
    isApproved: boolean;
};

/**
 * Composant Client pour gérer les actions sur un utilisateur.
 * Permet d'afficher des états de chargement et d'utiliser window.confirm() pour la suppression.
 */
export default function UserActions({ userId, userEmail, isApproved }: UserActionsProps) {
    const [loading, setLoading] = useState<string | null>(null); // 'approve', 'reject', 'delete' ou null

    // Valider l'utilisateur
    async function handleApprove() {
        setLoading('approve');
        await approveUser(userId, userEmail);
        setLoading(null);
    }

    // Refuser l'inscription
    async function handleReject() {
        if (!confirm("Voulez-vous vraiment refuser et supprimer cette demande ?")) return;
        setLoading('reject');
        await rejectUser(userId, userEmail);
        setLoading(null);
    }

    // Supprimer un utilisateur existant
    async function handleDelete() {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur définitivement ?")) return;
        setLoading('delete');
        await rejectUser(userId, userEmail); // On réutilise la même fonction de suppression
        setLoading(null);
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {!isApproved ? (
                // --- CAS : Utilisateur En Attente ---
                <>
                    {/* Bouton VALIDER */}
                    <button
                        onClick={handleApprove}
                        disabled={!!loading}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        {loading === 'approve' ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                        Valider
                    </button>

                    {/* Bouton REFUSER */}
                    <button
                        onClick={handleReject}
                        disabled={!!loading}
                        className="px-3 py-1.5 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        {loading === 'reject' ? <Loader2 size={14} className="animate-spin"/> : <XCircle size={14}/>}
                        Refuser
                    </button>
                </>
            ) : (
                // --- CAS : Utilisateur Déjà Validé ---
                // Bouton Poubelle pour supprimer un membre existant
                <button
                    onClick={handleDelete}
                    disabled={!!loading}
                    title="Supprimer l'utilisateur"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                >
                    {loading === 'delete' ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                </button>
            )}
        </div>
    );
}