import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, ShieldCheck, History } from "lucide-react";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm"; // Nous allons créer ce petit composant client

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 1. Récupération du profil
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // 2. Récupération des stats simples (pour ne pas laisser la page vide)
    const { count: totalReservations } = await supabase
        .from("reservations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

    const { count: activeReservations } = await supabase
        .from("reservations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("statut", "validée")
        .gte("date_fin", new Date().toISOString());

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">

            {/* EN-TÊTE */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {profile?.full_name?.charAt(0) || <User />}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{profile?.full_name || "Utilisateur"}</h1>
                    <p className="text-slate-500">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNE GAUCHE : Formulaire */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-indigo-600"/> Informations personnelles
                        </h2>

                        {/* On passe les données au composant Client pour gérer le formulaire */}
                        <UpdateProfileForm profile={profile} />
                    </div>
                </div>

                {/* COLONNE DROITE : Stats & Infos */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Carte Stats */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <History size={20} className="text-indigo-600"/> Mon Activité
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-indigo-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-indigo-700">{totalReservations || 0}</div>
                                <div className="text-xs text-indigo-500 font-medium uppercase mt-1">Total Réservations</div>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-emerald-700">{activeReservations || 0}</div>
                                <div className="text-xs text-emerald-500 font-medium uppercase mt-1">En cours</div>
                            </div>
                        </div>
                    </div>

                    {/* Carte Rôle */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-md text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-emerald-400" />
                            <span className="font-bold text-lg">Statut du compte</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-4">
                            Votre compte est actif et validé par l'administration.
                        </p>
                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono border border-white/20">
                            ID: {user.id.slice(0, 8)}...
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}