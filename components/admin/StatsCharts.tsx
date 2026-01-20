"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    PackageOpen,
    TrendingUp,
    TrendingDown,
    Minus,
    Users,
    AlertCircle,
} from "lucide-react";

// Palette de couleurs pour les graphiques
const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
];

type StatsProps = {
    monthlyData: { name: string; reservations: number }[];
    categoryData: { name: string; value: number }[];
    statusDistribution: { name: string; value: number }[];
    flopInstruments?: { name: string; count: number }[];

    // Données agrégées venant du serveur
    totalReservations: number;
    activeUsers: number;
    totalInstruments: number; // On le garde dans les props mais on ne l'affiche plus
    refusalRate: string;
};

/**
 * Tooltip pour le PieChart (Catégories).
 * Affiche la valeur et le pourcentage au survol.
 */
const CategoryTooltip = ({ active, payload, total }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl z-50">
                <p className="text-sm font-bold text-slate-800 mb-1">{payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }}></div>
                    <p className="text-sm font-medium text-slate-600">
                        {value} réservations <span className="text-slate-400">({percent}%)</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

/**
 * Tooltip standard pour les courbes et barres.
 */
const StandardTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl z-50">
                <p className="text-sm font-bold text-slate-800 mb-1">{label}</p>
                <p className="text-sm font-medium text-indigo-600">
                    {payload[0].value} réservations
                </p>
            </div>
        );
    }
    return null;
};

export default function StatsCharts({
                                        monthlyData,
                                        categoryData,
                                        statusDistribution,
                                        flopInstruments = [],
                                        totalReservations,
                                        activeUsers,
                                        refusalRate,
                                    }: StatsProps) {

    const hasData = monthlyData.some((d) => d.reservations > 0);

    if (!hasData) {
        return (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <PackageOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pas encore de données</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Les statistiques apparaîtront ici dès les premières réservations.
                </p>
            </div>
        );
    }

    // --- LOGIQUE DE CALCUL ---

    // 1. Calcul de la Tendance (Dynamique)
    // Compare la moyenne des 3 derniers mois vs les 3 mois d'avant.
    const recentMonths = monthlyData.slice(-3);
    const olderMonths = monthlyData.slice(-6, -3);

    const recentAvg = recentMonths.reduce((sum, m) => sum + m.reservations, 0) / (recentMonths.length || 1);
    const olderAvg = olderMonths.reduce((sum, m) => sum + m.reservations, 0) / (olderMonths.length || 1);

    // Formule : (Nouveau - Ancien) / Ancien * 100
    const trend = olderAvg === 0
        ? (recentAvg > 0 ? 100 : 0)
        : ((recentAvg - olderAvg) / olderAvg) * 100;

    // 2. Calcul du taux d'approbation (Validées / Total)
    const totalRequests = statusDistribution.reduce((sum, s) => sum + s.value, 0);
    const approvalRate = totalRequests > 0
        ? ((statusDistribution.find((s) => s.name === "Validées")?.value || 0) / totalRequests * 100).toFixed(1)
        : "0";

    // 3. Total pour le calcul des pourcentages du Pie Chart
    const totalCategoryVolume = categoryData.reduce((sum, cat) => sum + cat.value, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* --- SECTION 1 : KPIs (Carrés Compacts) --- */}
            {/* On a remplacé "Stock" par "Tendance" comme demandé */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {/* KPI 1 : Réservations TOTALES (Année en cours) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
                        {/* Icône fixe, pas d'animation */}
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 leading-none mb-1">
                            {totalReservations}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Réservations (Année)
                        </div>
                    </div>
                </div>

                {/* KPI 2 : Étudiants Actifs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 leading-none mb-1">
                            {activeUsers}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Étudiants Actifs
                        </div>
                    </div>
                </div>

                {/* KPI 3 : DYNAMIQUE (Remplacement du Stock) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square">
                    <div className={`p-3 rounded-xl mb-3 ${trend > 0 ? "bg-emerald-50 text-emerald-600" : trend < 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"}`}>
                        {trend > 0 ? <TrendingUp size={24} /> : trend < 0 ? <TrendingDown size={24} /> : <Minus size={24} />}
                    </div>
                    <div>
                        <div className={`text-3xl font-bold leading-none mb-1 ${trend > 0 ? "text-emerald-700" : trend < 0 ? "text-rose-700" : "text-slate-700"}`}>
                            {Math.abs(trend).toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Croissance (3 mois)
                        </div>
                    </div>
                </div>

                {/* KPI 4 : Taux de refus */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mb-3">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 leading-none mb-1">
                            {refusalRate}%
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Taux de refus (Annuel)
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2 : GRAPHIQUE D'ÉVOLUTION (Area Chart) --- */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900">
                        Évolution de la demande
                    </h3>
                    <p className="text-slate-500">
                        Volume des réservations sur les 12 derniers mois.
                    </p>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={monthlyData}
                            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorResa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#64748b" }}
                            />
                            <Tooltip
                                content={<StandardTooltip />}
                                cursor={{
                                    stroke: "#6366f1",
                                    strokeWidth: 2,
                                    strokeDasharray: "5 5",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="reservations"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorResa)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* --- SECTION 3 : DISTRIBUTION (Pie + Status) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Pie Chart (Catégories) */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">
                            Répartition par catégorie
                        </h3>
                        <p className="text-sm text-slate-500">
                            Basé sur l'ensemble des réservations de cette année.
                        </p>
                    </div>

                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                    cornerRadius={6}
                                    label={false}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={(props) => <CategoryTooltip {...props} total={totalCategoryVolume} />}
                                    wrapperStyle={{ zIndex: 1000, outline: "none" }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-slate-600 font-medium ml-1">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Indicateur central */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-slate-800">
                                    {categoryData.length}
                                </span>
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                                    Types
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Bar Chart (Statuts) */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Statuts des demandes
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Taux d'acceptation et de refus (Cette année)
                            </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-lg border border-emerald-100">
                            {approvalRate}%
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusDistribution} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip cursor={{ fill: "transparent" }} />
                                <Bar
                                    dataKey="value"
                                    radius={[8, 8, 8, 8]}
                                    barSize={50}
                                >
                                    {statusDistribution.map((entry, index) => {
                                        let color = "#94a3b8";
                                        if (entry.name === "Validées") color = "#10b981";
                                        if (entry.name === "Refusées") color = "#ef4444";
                                        if (entry.name === "En attente") color = "#f59e0b";
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- SECTION 4 : LES "FLOPS" (Matériel non utilisé) --- */}
            {flopInstruments && flopInstruments.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-slate-400" size={20} />
                        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                            Matériel peu sollicité (Top 5 Flops)
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {flopInstruments.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-500 shadow-sm"
                            >
                                {item.name}{" "}
                                <span className="ml-1 font-bold text-slate-300">
                                    ({item.count})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}