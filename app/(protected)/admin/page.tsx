import { createClient } from "@/lib/supabase/server";
import AdminRequestCard from "../../../components/admin/AdminRequestCard"; // Assure-toi que le fichier est bien dans components/admin/
import Link from "next/link";
import { Package, Users, ClipboardList } from "lucide-react";

/**
 * Page Tableau de Bord Administrateur (/admin).
 * C'est la page principale de l'admin. Elle permet de :
 * 1. Voir toutes les demandes de réservation en attente.
 * 2. Accéder à la gestion des utilisateurs et de l'inventaire.
 * 3. Valider ou refuser les demandes (via le composant enfant AdminRequestCard).
 */
export default async function AdminPage() {
    const supabase = await createClient();

    // 1. Récupération des données complexes (Jointures)
    // On veut : La demande -> Qui l'a faite (Profile) -> Ce qu'il y a dedans (Reservations + Instruments)
    const { data: requests, error } = await supabase
        .from("requests")
        .select(`
            *,
            profiles (
                full_name,
                email
            ),
            reservations (
                id,
                date_debut,
                date_fin,
                quantity,
                statut,
                message,
                instruments (
                    name,
                    image_url
                )
            )
        `)
        .order("created_at", { ascending: false }); // Les plus récentes en haut

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

                {/* Boutons de navigation Admin */}
                <div className="flex gap-3">
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

            {/* Liste des demandes (Requests) */}
            <div className="space-y-6">
                {requests?.map((req) => (
                    // On délègue l'affichage et la logique de validation à ce composant
                    <AdminRequestCard key={req.id} request={req} />
                ))}

                {/* État vide */}
                {(!requests || requests.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <ClipboardList className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">Aucune demande en cours.</p>
                        <p className="text-slate-400 text-sm">Tout est calme pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}