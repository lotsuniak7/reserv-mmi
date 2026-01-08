import { createClient } from "@/lib/supabase/server";
import AdminRequestCard from "@/app/(protected)/admin/AdminRequestCard";
import Link from "next/link";
import { Package } from "lucide-react";
import { User } from "lucide-react";

export default async function AdminPage() {
    const supabase = await createClient();

    // ЗАГРУЖАЕМ ЗАЯВКИ (Requests) вместе с их содержимым (reservations)
    const { data: requests, error } = await supabase
        .from("requests")
        .select(`
            *,
            profiles (
                full_name,
                email
            ),
            reservations (
                id, date_debut, date_fin, quantity, statut, message,
                instruments ( name, image_url )
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-6 text-red-500 bg-red-50">Erreur: {error.message}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="flex justify-between items-center border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Administration</h1>
                    <p className="text-[var(--text-secondary)]">Gérez les demandes de matériel.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:opacity-90 transition font-medium text-sm">
                        <User size={18}/> Users
                    </Link>
                    <Link href="/admin/inventaire" className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:opacity-90 transition font-medium text-sm">
                        <Package size={18}/> Inventaire
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                {requests?.map((req) => (
                    <AdminRequestCard key={req.id} request={req} />
                ))}

                {requests?.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                        Aucune demande en cours.
                    </div>
                )}
            </div>
        </div>
    );
}