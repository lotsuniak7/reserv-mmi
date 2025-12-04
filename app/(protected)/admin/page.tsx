// app/(protected)/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import AdminReservationRow from "@/app/(protected)/admin/AdminReservationRow";
import Link from "next/link";
import {Package} from "lucide-react";

export default async function AdminPage() {
    const supabase = await createClient();

    // Загружаем данные
    const { data: reservations, error } = await supabase
        .from("reservations")
        .select(`
            id, date_debut, date_fin, statut, message, created_at,
            instruments ( name, image_url ),
            user_id
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-6 text-red-500 bg-red-50 rounded-lg">Erreur: {error.message}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                        Administration
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Gérez les réservations et le matériel.
                    </p>
                </div>

                {/* Кнопка перехода в Инвентарь */}
                <Link
                    href="/admin/inventaire"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-white rounded-lg hover:opacity-90 transition shadow-sm text-sm font-medium"
                >
                    <Package size={16} />
                    Gérer l'inventaire
                </Link>
            </div>

            <div className="card overflow-hidden border border-[var(--border)] shadow-sm bg-white rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-[var(--border)]">
                        <tr>
                            <th className="px-6 py-5 w-[350px]">Matériel & Demandeur</th>
                            <th className="px-6 py-5">Dates de réservation</th>
                            <th className="px-6 py-5">Message / Note</th>
                            <th className="px-6 py-5">Statut</th>
                            <th className="px-6 py-5 text-right w-[200px]">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                        {reservations?.map((resa) => (
                            <AdminReservationRow key={resa.id} reservation={resa} />
                        ))}
                        {reservations?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-[var(--text-secondary)]">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full grid place-items-center text-xl">📭</div>
                                        <span className="text-lg font-medium">Aucune demande en cours</span>
                                        <span className="text-sm">Les nouvelles demandes apparaîtront ici.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}