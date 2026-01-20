import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import StatsCharts from "@/components/admin/StatsCharts";

// Définition des types pour la sécurité des données (TypeScript)
interface Instrument {
    name: string;
    categorie: string;
}

interface Reservation {
    id: string;
    date_debut: string;
    statut: "validée" | "refusée" | "en attente";
    user_id: string;
    instruments: Instrument | null;
}

interface Profile {
    id: string;
    full_name: string;
    email: string;
}

/**
 * Page Serveur : Statistiques Administrateur
 * Charge toutes les données brutes depuis Supabase, effectue les calculs mathématiques (KPIs),
 * et passe les résultats pré-calculés au composant client StatsCharts.
 */
export default async function AdminStatsPage() {
    const supabase = await createClient();

    // 1. Vérification de sécurité : Seul l'admin peut voir cette page
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== "admin") return redirect("/");

    // 2. Chargement des données brutes (Réservations, Profils, Stock)
    const { data: reservations, error: resError } = await supabase
        .from("reservations")
        .select(`
            id,
            date_debut,
            statut,
            user_id,
            instruments (
                name,
                categorie
            )
        `) as { data: Reservation[] | null; error: any };

    const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("id, full_name, email") as { data: Profile[] | null; error: any };

    // On récupère le nombre exact d'instruments en stock (count)
    const { count: totalInstruments, error: instError } = await supabase
        .from("instruments")
        .select("*", { count: "exact", head: true });

    // Gestion des erreurs de base de données
    if (resError || profError || instError || !reservations) {
        return (
            <div className="p-8 text-red-500 font-medium bg-red-50 rounded-lg m-6 border border-red-200">
                Erreur lors du chargement des statistiques. Veuillez vérifier la connexion ou les droits.
            </div>
        );
    }

    // --- TRAITEMENT DES DONNÉES (CALCULS) ---

    // A. Évolution mensuelle (Graphique en courbes)
    // On initialise d'abord les 12 derniers mois à 0 pour éviter les "trous" dans le graphique
    const monthsMap = new Map<string, number>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }); // Ex: "janv. 26"
        monthsMap.set(key, 0);
    }

    // On remplit avec les vraies données
    reservations.forEach((r) => {
        const d = new Date(r.date_debut);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        if (monthsMap.has(key)) monthsMap.set(key, (monthsMap.get(key) || 0) + 1);
    });

    // Conversion en tableau pour Recharts
    const monthlyData = Array.from(monthsMap.entries()).map(([name, reservations]) => ({
        name,
        reservations,
    }));

    // B. Répartition par Catégorie (Camembert)
    const categoryMap: Record<string, number> = {};
    reservations.forEach((r) => {
        const cat = r.instruments?.categorie || "Autre";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    // Tri décroissant pour afficher les plus grosses catégories en premier
    const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // C. Analyse du Matériel (Top & Flop)
    const instrumentCount: Record<string, number> = {};
    reservations.forEach((r) => {
        const name = r.instruments?.name || "Supprimé";
        instrumentCount[name] = (instrumentCount[name] || 0) + 1;
    });

    const sortedInstruments = Object.entries(instrumentCount).sort(([, a], [, b]) => b - a);

    // On garde uniquement les "Flops" (les 5 moins utilisés) pour l'affichage
    const flopInstruments = sortedInstruments.slice(-5).reverse().map(([name, count]) => ({ name, count }));

    // D. Top Étudiants (Pour le tableau en bas de page)
    const userCount: Record<string, number> = {};
    reservations.forEach((r) => {
        userCount[r.user_id] = (userCount[r.user_id] || 0) + 1;
    });

    const topUsers = Object.entries(userCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5
        .map(([userId, count]) => {
            const profile = profiles?.find((p) => p.id === userId);
            return {
                name: profile?.full_name || "Utilisateur supprimé",
                email: profile?.email || "—",
                count,
            };
        });

    // E. Statuts (Graphique en barres)
    const statusCount = { validée: 0, refusée: 0, "en attente": 0 };
    reservations.forEach((r) => {
        if (statusCount[r.statut] !== undefined) statusCount[r.statut]++;
    });
    const statusDistribution = [
        { name: "Validées", value: statusCount["validée"] },
        { name: "Refusées", value: statusCount["refusée"] },
        { name: "En attente", value: statusCount["en attente"] },
    ];

    // F. KPIs Globaux (Pour les cartes carrées)
    const totalReservations = reservations.length;
    const activeUsers = Object.keys(userCount).length;

    // Calcul du taux de refus en pourcentage
    const refusalRate = totalReservations > 0
        ? ((statusCount["refusée"] / totalReservations) * 100).toFixed(1)
        : "0";

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">

            {/* 1. EN-TÊTE DE LA PAGE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                    <p className="text-slate-500 mt-1">Rapport de performance et utilisation du stock.</p>
                </div>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition"
                >
                    <ArrowLeft size={16} />
                    Retour au tableau de bord
                </Link>
            </div>

            {/* 2. GRAPHIQUES ET KPIS (Composant Client) */}
            {/* CORRECTION BUG : On ne passe plus 'topInstruments' car le composant n'en a plus besoin */}
            <StatsCharts
                monthlyData={monthlyData}
                categoryData={categoryData}
                statusDistribution={statusDistribution}
                flopInstruments={flopInstruments}
                totalReservations={totalReservations}
                activeUsers={activeUsers}
                totalInstruments={totalInstruments || 0}
                refusalRate={refusalRate}
            />

            {/* 3. TABLEAU DES ÉTUDIANTS LES PLUS ACTIFS */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Top Étudiants</h3>
                        <p className="text-sm text-slate-500">Les utilisateurs ayant effectué le plus de réservations.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 w-16">#</th>
                            <th className="px-6 py-3">Étudiant</th>
                            <th className="px-6 py-3 text-right">Réservations</th>
                            <th className="px-6 py-3 text-right w-32">Activité</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {topUsers.map((user, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-400">#{idx + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-indigo-600 text-base">
                                    {user.count}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Barre de progression visuelle */}
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(user.count / (topUsers[0]?.count || 1)) * 100}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}