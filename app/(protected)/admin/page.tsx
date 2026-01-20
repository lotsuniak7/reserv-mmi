import { createClient } from "@/lib/supabase/server";
import AdminRequestCard from "../../../components/admin/AdminRequestCard";
import Link from "next/link";
import { Package, Users, ClipboardList, ChartNoAxesCombined } from "lucide-react";


export const dynamic = 'force-dynamic';
/**
 * Page Tableau de Bord Administrateur (/admin).
 */
export default async function AdminPage() {
    const supabase = await createClient();

    const { data: requests, error } = await supabase
        .from("requests")
        .select(`
            *,
            profiles (
                full_name,
                email,
                phone,
                filiere,
                parcours
            ),
            reservations (
                id,
                date_debut,
                date_fin,
                start_time,
                end_time,
                quantity,
                statut,
                message,
                instruments (
                    name,
                    image_url
                )
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="p-6 m-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <h3 className="font-bold">Erreur de chargement</h3>
                <p>{error.message}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">

            {/* En-tête du Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
                    <p className="text-slate-500 mt-1">Gérez les demandes de matériel et les stocks.</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin/stats"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm shadow-sm"
                    >
                        <ChartNoAxesCombined size={18} />
                        Analytics
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm shadow-sm"
                    >
                        <Users size={18} />
                        Utilisateurs
                    </Link>
                    <Link
                        href="/admin/inventaire"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm shadow-sm"
                    >
                        <Package size={18} />
                        Gérer l'Inventaire
                    </Link>
                </div>
            </div>

            {/* Liste des demandes */}
            <div className="space-y-6">
                {requests?.map((req) => (
                    // @ts-ignore - On ignore l'erreur de typage stricte ici pour simplifier, car req contient bien les données
                    <AdminRequestCard key={req.id} request={req} />
                ))}

                {(!requests || requests.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <ClipboardList className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">Aucune demande en cours.</p>
                    </div>
                )}
            </div>
        </div>
    );
}