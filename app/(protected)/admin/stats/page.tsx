import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react"; // убрали лишние иконки, они теперь в StatsCharts
import Link from "next/link";
import StatsCharts from "@/components/admin/StatsCharts";

// Типы для данных
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

export default async function AdminStatsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== "admin") return redirect("/");

    // Загружаем данные
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

    const { count: totalInstruments, error: instError } = await supabase
        .from("instruments")
        .select("*", { count: "exact", head: true });

    if (resError || profError || instError || !reservations) {
        return (
            <div className="p-8 text-red-500">
                Erreur de chargement des données. Veuillez réessayer.
            </div>
        );
    }

    // Обработка данных (без изменений)
    const monthsMap = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        monthsMap.set(key, 0);
    }
    reservations.forEach((r) => {
        const d = new Date(r.date_debut);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        if (monthsMap.has(key)) monthsMap.set(key, (monthsMap.get(key) || 0) + 1);
    });
    const monthlyData = Array.from(monthsMap.entries()).map(([name, reservations]) => ({
        name,
        reservations,
    }));

    const categoryMap: Record<string, number> = {};
    reservations.forEach((r) => {
        const cat = r.instruments?.categorie || "Autre";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const instrumentCount: Record<string, number> = {};
    reservations.forEach((r) => {
        const name = r.instruments?.name || "Supprimé";
        instrumentCount[name] = (instrumentCount[name] || 0) + 1;
    });
    const sortedInstruments = Object.entries(instrumentCount).sort(([, a], [, b]) => b - a);
    const topInstruments = sortedInstruments.slice(0, 8).map(([name, count]) => ({ name, count }));
    const flopInstruments = sortedInstruments.slice(-5).reverse().map(([name, count]) => ({ name, count }));

    const userCount: Record<string, number> = {};
    reservations.forEach((r) => {
        userCount[r.user_id] = (userCount[r.user_id] || 0) + 1;
    });
    const topUsers = Object.entries(userCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
            const profile = profiles?.find((p) => p.id === userId);
            return {
                name: profile?.full_name || "Utilisateur supprimé",
                email: profile?.email || "—",
                count,
            };
        });

    const statusCount = { validée: 0, refusée: 0, "en attente": 0 };
    reservations.forEach((r) => {
        if (statusCount[r.statut] !== undefined) statusCount[r.statut]++;
    });
    const statusDistribution = [
        { name: "Validées", value: statusCount["validée"] },
        { name: "Refusées", value: statusCount["refusée"] },
        { name: "En attente", value: statusCount["en attente"] },
    ];

    // KPIs — вычисляем здесь, передаём в компонент
    const totalReservations = reservations.length;
    const activeUsers = Object.keys(userCount).length;
    const refusalRate =
        totalReservations > 0
            ? ((statusCount["refusée"] / totalReservations) * 100).toFixed(1)
            : "0";

    // Utilization Rate (можно оставить, если хочешь потом добавить отдельно)
    const utilizationRate =
        totalInstruments && Object.keys(instrumentCount).length > 0
            ? ((Object.keys(instrumentCount).length / totalInstruments) * 100).toFixed(1)
            : "0";

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* EN-TÊTE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                    <p className="text-slate-500 mt-1">Rapport de performance et utilisation du stock.</p>
                </div>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Retour Dashboard
                </Link>
            </div>

            {/* Передаём все нужные данные в StatsCharts */}
            <StatsCharts
                monthlyData={monthlyData}
                topInstruments={topInstruments}
                categoryData={categoryData}
                statusDistribution={statusDistribution}
                flopInstruments={flopInstruments}
                totalReservations={totalReservations}
                activeUsers={activeUsers}
                totalInstruments={totalInstruments || 0}
                refusalRate={refusalRate}
            />

            {/* TABLEAU TOP USERS */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Top Étudiants</h3>
                        <p className="text-sm text-slate-500">Les utilisateurs les plus actifs de la plateforme.</p>
                    </div>
                    <Link href="/admin/users" className="text-sm text-indigo-600 hover:underline font-medium">
                        Voir tous les utilisateurs
                    </Link>
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
                            <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-mono text-slate-400">#{idx + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-indigo-600 text-base">
                                    {user.count}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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