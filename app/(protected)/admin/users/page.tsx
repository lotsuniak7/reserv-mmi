import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import UserActions from "@/components/admin/UserActions"; // Import du nouveau composant

/**
 * Page Gestion des Utilisateurs (/admin/users).
 * Affiche la liste de tous les inscrits (validés ou en attente).
 * L'admin connecté est masqué de la liste.
 */
export default async function AdminUsersPage() {
    const supabase = await createClient();

    // 1. On récupère l'utilisateur connecté (l'admin actuel)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Récupération des profils triés : les non-approuvés en premier, puis par date récente
    const { data: rawProfiles } = await supabase
        .from("profiles")
        .select("*")
        .order("is_approved", { ascending: true }) // false (en attente) d'abord
        .order("created_at", { ascending: false });

    // 3. FILTRAGE : On retire l'admin actuel de la liste
    // Cela empêche l'admin de se voir et de se supprimer accidentellement.
    const profiles = rawProfiles?.filter(p => p.id !== user?.id);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">

            {/* En-tête avec navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des utilisateurs</h1>
                    <p className="text-slate-500 mt-1">Validez les nouvelles inscriptions ou gérez les membres.</p>
                </div>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition"
                >
                    <ArrowLeft size={16} />
                    Retour au tableau de bord
                </Link>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Nom / Email</th>
                        <th className="px-6 py-4">Date inscription</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {profiles?.map((profile) => (
                        <tr key={profile.id} className="hover:bg-slate-50/80 transition-colors">

                            {/* Colonne Identité */}
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{profile.full_name || "Utilisateur sans nom"}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{profile.email}</div>
                            </td>

                            {/* Colonne Date */}
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </td>

                            {/* Colonne Statut */}
                            <td className="px-6 py-4">
                                {profile.is_approved ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold uppercase tracking-wide">
                                        <ShieldCheck size={14} /> Validé
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wide">
                                        <Clock size={14} /> En attente
                                    </span>
                                )}
                            </td>

                            {/* Colonne Actions (Composant Client) */}
                            <td className="px-6 py-4 text-right">
                                <UserActions
                                    userId={profile.id}
                                    userEmail={profile.email}
                                    isApproved={profile.is_approved}
                                />
                            </td>
                        </tr>
                    ))}

                    {/* État vide */}
                    {(!profiles || profiles.length === 0) && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                Aucun autre utilisateur inscrit pour le moment.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}