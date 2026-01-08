import { createClient } from "@/lib/supabase/server";
import { Check, ShieldCheck, XCircle, Trash2 } from "lucide-react"; // J'ai ajouté Trash2
import { approveUser, rejectUser } from "@/app/actions"; // N'oublie pas d'importer rejectUser

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("is_approved", { ascending: true })
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Nom / Email</th>
                        <th className="px-6 py-4">Date inscription</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {profiles?.map((profile) => (
                        <tr key={profile.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{profile.full_name || "Sans nom"}</div>
                                <div className="text-sm text-slate-500">{profile.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                                {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-6 py-4">
                                {profile.is_approved ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                                            <ShieldCheck size={14} /> Validé
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">
                                            ⏳ En attente
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {!profile.is_approved && (
                                        <>
                                            {/* Bouton VALIDER */}
                                            <form action={async () => {
                                                "use server";
                                                await approveUser(profile.id, profile.email);
                                            }}>
                                                <button className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
                                                    <Check size={14}/> Valider
                                                </button>
                                            </form>

                                            {/* Bouton REFUSER (Nouveau) */}
                                            <form action={async () => {
                                                "use server";
                                                await rejectUser(profile.id, profile.email);
                                            }}>
                                                <button className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition flex items-center gap-2">
                                                    <XCircle size={14}/> Refuser
                                                </button>
                                            </form>
                                        </>
                                    )}

                                    {/* Optionnel : Bouton Poubelle pour les utilisateurs déjà validés si tu veux pouvoir les virer plus tard */}
                                    {profile.is_approved && (
                                        <form action={async () => {
                                            "use server";
                                            if(confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
                                                await rejectUser(profile.id, profile.email);
                                            }
                                        }}>
                                            <button className="p-2 text-slate-400 hover:text-red-600 transition">
                                                <Trash2 size={16}/>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}