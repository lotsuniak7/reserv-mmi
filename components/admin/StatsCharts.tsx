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
    Trophy,
    AlertTriangle,
    CalendarDays,
    Users,
    Layers,
    AlertCircle,
} from "lucide-react";

// Couleurs
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
    topInstruments: { name: string; count: number }[];
    categoryData: { name: string; value: number }[];
    statusDistribution: { name: string; value: number }[];
    flopInstruments?: { name: string; count: number }[];
    // Добавляем пропсы, которые нужны для верхних KPI (они приходят из page.tsx)
    totalReservations: number;
    activeUsers: number;
    totalInstruments: number;
    refusalRate: string;
};

// Улучшенный Tooltip с процентами
const CustomTooltip = ({ active, payload, label, total }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl z-50">
                <p className="text-sm font-bold text-slate-800 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <p className="text-sm font-medium text-slate-600">
                        {value} réservations ({percent}%)
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function StatsCharts({
                                        monthlyData,
                                        topInstruments,
                                        categoryData,
                                        statusDistribution,
                                        flopInstruments = [],
                                        totalReservations,
                                        activeUsers,
                                        totalInstruments,
                                        refusalRate,
                                    }: StatsProps) {
    const hasData = monthlyData.some((d) => d.reservations > 0);

    if (!hasData) {
        return (
            <div className="p-16 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <PackageOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pas encore de données</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Les graphiques apparaîtront ici dès que les premières réservations seront effectuées.
                </p>
            </div>
        );
    }

    // CALCULS
    const recentMonths = monthlyData.slice(-3);
    const olderMonths = monthlyData.slice(-6, -3);
    const recentAvg =
        recentMonths.reduce((sum, m) => sum + m.reservations, 0) /
        (recentMonths.length || 1);
    const olderAvg =
        olderMonths.reduce((sum, m) => sum + m.reservations, 0) /
        (olderMonths.length || 1);
    const trend =
        olderAvg === 0
            ? recentAvg > 0
                ? 100
                : 0
            : ((recentAvg - olderAvg) / olderAvg) * 100;

    const totalRequests = statusDistribution.reduce((sum, s) => sum + s.value, 0);
    const approvalRate =
        totalRequests > 0
            ? (
                (statusDistribution.find((s) => s.name === "Validées")?.value || 0) /
                totalRequests *
                100
            ).toFixed(1)
            : "0";

    const totalTopCount = topInstruments.reduce((sum, i) => sum + i.count, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* BLOC 1: KPIs — компактная и органичная версия */}
            <div className="space-y-6">
                {/* Верхний ряд — 4 основных KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Réservations */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {totalReservations}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                Réservations
                            </div>
                        </div>
                    </div>

                    {/* Étudiants actifs */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {activeUsers}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                Étudiants actifs
                            </div>
                        </div>
                    </div>

                    {/* Articles en stock */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Layers size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {totalInstruments || 0}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                Articles en stock
                            </div>
                        </div>
                    </div>

                    {/* Taux de refus */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {refusalRate}%
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                Taux de refus
                            </div>
                        </div>
                    </div>
                </div>

                {/* Нижний ряд — 3 инсайта, компактные */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dynamique */}
                    <div
                        className={`p-4 rounded-xl border flex items-center gap-3 transition-all hover:shadow-md ${
                            trend > 0
                                ? "bg-emerald-50/70 border-emerald-200"
                                : trend < 0
                                    ? "bg-rose-50/70 border-rose-200"
                                    : "bg-slate-50 border-slate-200"
                        }`}
                    >
                        <div
                            className={`p-2 rounded-lg shrink-0 ${
                                trend > 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : trend < 0
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-slate-200 text-slate-700"
                            }`}
                        >
                            {trend > 0 ? (
                                <TrendingUp size={20} />
                            ) : trend < 0 ? (
                                <TrendingDown size={20} />
                            ) : (
                                <Minus size={20} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-base font-bold text-slate-800">Dynamique</div>
                            <div className="text-xl font-extrabold text-slate-900">
                                {Math.abs(trend).toFixed(0)}%
                                <span className="text-sm font-medium text-slate-500 ml-2">
                  {trend > 0 ? "croissance" : "baisse"} (3 mois)
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Catégorie Reine */}
                    <div className="p-4 rounded-xl border bg-indigo-50/70 border-indigo-200 flex items-center gap-3 hover:shadow-md transition-all">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                            <Trophy size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-base font-bold text-indigo-900">
                                Catégorie reine
                            </div>
                            <div className="text-base font-semibold text-slate-800 truncate">
                                {categoryData.reduce((a, b) =>
                                    a.value > b.value ? a : b
                                ).name || "—"}
                            </div>
                            <div className="text-xs text-slate-500">la plus demandée</div>
                        </div>
                    </div>

                    {/* Ce mois-ci */}
                    <div className="p-4 rounded-xl border bg-white border-slate-200 flex items-center gap-3 hover:shadow-md transition-all">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <div className="text-base font-bold text-slate-700">
                                Ce mois-ci
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">
                                {monthlyData[monthlyData.length - 1]?.reservations || 0}
                                <span className="text-sm font-medium text-slate-500 ml-2">
                  réservations
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOC 2: ÉVOLUTION */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900">
                        Évolution de la demande
                    </h3>
                    <p className="text-slate-500">
                        Volume des réservations sur les 12 derniers mois
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
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                            />
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
                                content={(props) => (
                                    <CustomTooltip {...props} total={totalTopCount} />
                                )}
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
                                animationDuration={800}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BLOC 3: TOP MATÉRIEL */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Trophy className="text-amber-500" size={24} />
                            Top Matériel
                        </h3>
                        <p className="text-slate-500 mt-1">
                            Les équipements stars de votre inventaire.
                        </p>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={topInstruments}
                            layout="vertical"
                            margin={{ left: 20, right: 30 }}
                            barSize={24}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={true}
                                vertical={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={200}
                                tick={{ fill: "#334155", fontSize: 13, fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "#f8fafc" }}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[0, 6, 6, 0]}
                                animationDuration={800}
                            >
                                {topInstruments.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index < 3 ? "#4f46e5" : "#94a3b8"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BLOC 4: DISTRIBUTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PieChart */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                        Répartition par catégorie
                    </h3>
                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={6}
                                    animationDuration={800}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
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
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                <span className="block text-3xl font-bold text-slate-800">
                  {categoryData.length}
                </span>
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Catégories
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BarChart Statuts */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Statuts des demandes
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Taux de validation global
                            </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-lg border border-emerald-100">
                            {approvalRate}%
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusDistribution} margin={{ top: 20 }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
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
                                    animationDuration={800}
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

            {/* BLOC 5: FLOPS */}
            {flopInstruments && flopInstruments.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-slate-400" size={20} />
                        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                            Matériel peu sollicité (Flops)
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {flopInstruments.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-500 shadow-sm flex justify-between items-center"
                            >
                                <span className="font-medium">{item.name}</span>
                                <span className="ml-2 font-bold text-slate-300">
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