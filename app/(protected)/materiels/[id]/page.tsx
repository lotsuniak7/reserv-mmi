import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductActions from "@/components/ProductActions";

type Instrument = {
    id: number;
    name: string;
    status: string;
    categorie: string | null;
    quantite: number | null;
    image_url: string | null;
    description: string | null;
    caracteristiques: Record<string, any> | null;
};

// Добавили searchParams
export default async function Page({
                                       params,
                                       searchParams
                                   }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ start?: string, end?: string }>
}) {
    const supabase = await createClient();
    const { id } = await params;
    const { start, end } = await searchParams; // Читаем даты из URL

    // 1. Загружаем сам товар
    const { data: itRaw, error } = await supabase
        .from("instruments")
        .select("*")
        .eq("id", Number(id))
        .single();

    if (error || !itRaw) notFound();
    const it = itRaw as Instrument;

    // 2. Загружаем бронирования для этого товара
    const { data: reservations } = await supabase
        .from("reservations")
        .select("date_debut, date_fin, quantity")
        .eq("instrument_id", it.id)
        .neq("statut", "refusée")
        .neq("statut", "terminée");

    const statusMap: Record<string, { text: string; classes: string }> = {
        dispo: { text: "disponible", classes: "bg-green-100 text-green-700" },
        available: { text: "disponible", classes: "bg-green-100 text-green-700" },
        indisponible: { text: "indisponible", classes: "bg-red-100 text-red-700" },
        "réservé": { text: "réservé", classes: "bg-amber-100 text-amber-700" },
    };
    const st = statusMap[it.status] ?? { text: it.status, classes: "bg-slate-100 text-slate-700" };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            <div className="text-sm text-[var(--text-secondary)]">
                <Link href="/" className="hover:underline">Catalogue</Link>
                <span className="mx-2">/</span>
                <span>{it.name}</span>
            </div>

            <div className="card p-4 bg-white border border-[var(--border)]">
                <div className="rounded-xl overflow-hidden bg-[var(--surface)] w-full h-[400px] relative flex items-center justify-center">
                    {it.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={it.image_url} alt={it.name} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                            <span className="text-4xl">📷</span>
                            <span>Pas d'image</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-8 space-y-8 h-fit">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{it.name}</h1>
                            {it.categorie && (
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wide">
                                    {it.categorie}
                                </span>
                            )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${st.classes}`}>
                            {st.text}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-lg text-[var(--text-primary)] border-b pb-2">Description</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {it.description || "Aucune description."}
                        </p>
                    </div>

                    {it.caracteristiques && Object.keys(it.caracteristiques).length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-lg text-[var(--text-primary)] border-b pb-2">Caractéristiques</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {Object.entries(it.caracteristiques).map(([k, v]) => (
                                    <div key={k} className="flex justify-between py-1 border-b border-dashed border-slate-100">
                                        <dt className="text-[var(--text-secondary)]">{k}</dt>
                                        <dd className="font-medium text-[var(--text-primary)]">{String(v)}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Передаем начальные даты, если они есть */}
                    <ProductActions
                        instrument={it}
                        reservations={reservations || []}
                        totalQty={it.quantite || 1}
                        initialStart={start}
                        initialEnd={end}
                    />
                </div>
            </div>
        </div>
    );
}