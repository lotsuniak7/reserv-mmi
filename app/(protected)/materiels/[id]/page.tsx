import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReservationButton from "@/components/ReservationButton";

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

// MODIFICATION ICI : params est une Promise maintenant
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();

    // On attend que les paramètres soient chargés
    const { id } = await params;

    const { data, error } = await supabase
        .from("instruments")
        .select("id,name,status,categorie,quantite,image_url,description,caracteristiques")
        .eq("id", Number(id)) // On utilise l'ID récupéré
        .single();

    if (error || !data) notFound();

    const it = data as Instrument;

    const statusMap: Record<string, { text: string; classes: string }> = {
        dispo: { text: "disponible", classes: "bg-green-100 text-green-700" },
        available: { text: "disponible", classes: "bg-green-100 text-green-700" },
        "réservé": { text: "réservé", classes: "bg-amber-100 text-amber-700" },
        indisponible: { text: "indisponible", classes: "bg-red-100 text-red-700" },
    };
    const st = statusMap[it.status] ?? { text: it.status, classes: "bg-slate-100 text-slate-700" };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-sm text-[var(--text-secondary)]">
                {/* CORRECTION DU LIEN RETOUR : vers "/" */}
                <Link href="/" className="hover:underline">Catalogue</Link>
                <span className="mx-2">/</span>
                <span>{it.name}</span>
            </div>

            <div className="card p-4">
                <div className="rounded-lg overflow-hidden bg-[var(--surface)]">
                    <div className="w-full aspect-video">
                        {it.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={it.image_url}
                                alt={it.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-sm text-[var(--text-secondary)]">
                                Pas d'image
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card p-6 space-y-4">
                <h1 className="text-2xl font-bold">{it.name}</h1>

                <div className="flex flex-wrap items-center gap-2">
                    {it.categorie && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                            {it.categorie}
                        </span>
                    )}
                    {typeof it.quantite === "number" && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                            Qté : {it.quantite}
                        </span>
                    )}
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${st.classes}`}>
                        {st.text}
                    </span>
                </div>

                <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Description</h2>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {it.description ?? "Aucune description pour le moment."}
                    </p>
                </div>

                <div className="space-y-3">
                    <h2 className="font-semibold text-lg">Caractéristiques</h2>
                    {it.caracteristiques && Object.keys(it.caracteristiques).length > 0 ? (
                        <dl className="space-y-2 text-sm">
                            {Object.entries(it.caracteristiques).map(([k, v]) => (
                                <div key={k} className="flex gap-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                                    <dt className="w-48 text-[var(--text-secondary)] font-medium flex-shrink-0">
                                        {k}
                                    </dt>
                                    <dd className="flex-1 text-[var(--text-primary)]">
                                        {String(v)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-sm text-[var(--text-secondary)]">
                            Aucune caractéristique saisie.
                        </p>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    {/* CORRECTION DU LIEN RETOUR : vers "/" */}
                    <Link
                        href="/"
                        className="px-6 py-2 rounded-lg card hover:opacity-80 transition"
                    >
                        Retour au catalogue
                    </Link>

                    {/* Notre bouton de réservation fonctionnel */}
                    <ReservationButton instrumentId={it.id} instrumentName={it.name} />
                </div>
            </div>
        </div>
    );
}