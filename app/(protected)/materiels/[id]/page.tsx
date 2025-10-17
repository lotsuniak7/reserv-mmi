import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("instruments")
        .select("id,name,status,categorie,quantite,image_url,description,caracteristiques")
        .eq("id", Number(params.id))
        .single();

    if (error) notFound();
    const it = data as Instrument;

    const statusMap: Record<string, { text: string; classes: string }> = {
        dispo: { text: "disponible", classes: "bg-green-100 text-green-700" },
        "réservé": { text: "réservé", classes: "bg-amber-100 text-amber-700" },
        indisponible: { text: "indisponible", classes: "bg-red-100 text-red-700" },
    };
    const st = statusMap[it.status] ?? { text: it.status, classes: "bg-slate-100 text-slate-700" };

    return (
        <div className="space-y-6">
            <div className="text-sm text-[var(--text-secondary)]">
                <Link href="/" className="hover:underline">Matériels</Link>
                <span className="mx-2">/</span>
                <span>{it.name}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="card p-4">
                    <div className="rounded overflow-hidden bg-[var(--surface)]">
                        <div className="w-full aspect-video">
                            {it.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full grid place-items-center text-sm text-[var(--text-secondary)]">
                                    Pas d’image
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Infos */}
                <div className="card p-6 space-y-4">
                    <h1 className="text-2xl font-bold">{it.name}</h1>

                    <div className="flex flex-wrap items-center gap-2">
                        {it.categorie && (
                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">{it.categorie}</span>
                        )}
                        {typeof it.quantite === "number" && (
                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">Qté : {it.quantite}</span>
                        )}
                        <span className={`ml-auto px-2 py-1 rounded-full ${st.classes}`}>{st.text}</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-semibold">Description</h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {it.description ?? "Aucune description pour le moment."}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-semibold">Caractéristiques</h2>
                        {it.caracteristiques && Object.keys(it.caracteristiques).length > 0 ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {Object.entries(it.caracteristiques).map(([k, v]) => (
                                    <div key={k} className="flex">
                                        <dt className="w-40 text-[var(--text-secondary)]">{k}</dt>
                                        <dd className="flex-1">{String(v)}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">Aucune caractéristique saisie.</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Link href="/" className="px-4 py-2 rounded-lg card hover:opacity-90">Retour au catalogue</Link>
                        <button className="px-4 py-2 rounded-lg text-white hover:opacity-90"
                                style={{ background: "var(--primary)" }}>
                            Réserver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}