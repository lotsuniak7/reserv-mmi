import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CancelButton from "@/components/CancelBurron";

// 1. Adaptation du Type TypeScript à votre schéma
type ReservationWithInstrument = {
    id: number;
    date_debut: string; // Correspond à votre colonne date_debut
    date_fin: string;   // Correspond à votre colonne date_fin
    statut: string;     // Correspond à votre colonne statut
    message: string | null; // Correspond à votre colonne message
    // La jointure avec la table instruments
    instruments: {
        name: string;
        image_url: string | null;
        categorie: string | null;
    } | null;
};

export default async function MesReservationsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 2. Requête Supabase avec vos vrais noms de colonnes
    const { data: rawReservations, error } = await supabase
        .from("reservations")
        .select(`
            id, date_debut, date_fin, statut, message,
            instruments ( name, image_url, categorie )
        `)
        .eq("user_id", user.id)
        .order("date_debut", { ascending: false });

    if (error) {
        return (
            <div className="card p-6 border-red-200 bg-red-50 text-red-700">
                Erreur : {error.message}
            </div>
        );
    }

    const reservations = rawReservations as unknown as ReservationWithInstrument[];

    // 3. Mapping des couleurs selon la valeur du texte "statut"
    // J'assume ici des valeurs standards, adaptez les clés si vos statuts sont différents en base
    const statusStyles: Record<string, string> = {
        "en attente": "bg-amber-100 text-amber-700 border-amber-200",
        "validé": "bg-green-100 text-green-700 border-green-200",
        "validée": "bg-green-100 text-green-700 border-green-200", // Au cas où
        "refusé": "bg-red-100 text-red-700 border-red-200",
        "terminé": "bg-slate-100 text-slate-600 border-slate-200",
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mes réservations</h1>
                <Link href="/" className="text-sm font-medium text-[var(--primary)] hover:underline">
                    + Nouvelle réservation
                </Link>
            </div>

            {reservations.length === 0 ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
                        📦
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Aucune réservation</h2>
                        <p className="text-[var(--text-secondary)]">Vous n'avez pas encore réservé de matériel.</p>
                    </div>
                    <Link
                        href="/materiels"
                        className="px-4 py-2 rounded-lg text-white transition hover:opacity-90 mt-2"
                        style={{ background: "var(--primary)" }}
                    >
                        Consulter le catalogue
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reservations.map((resa) => (
                        <div key={resa.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center group hover:shadow-md transition-all">
                            {/* Image du matériel */}
                            <div className="w-full sm:w-24 h-24 sm:h-16 rounded-lg bg-[var(--surface)] overflow-hidden flex-shrink-0 relative border border-[var(--border)]">
                                {resa.instruments?.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={resa.instruments.image_url}
                                        alt={resa.instruments.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                                        No IMG
                                    </div>
                                )}
                                <div className="w-full sm:w-auto flex sm:flex-col gap-2 justify-end pl-0 sm:pl-4 sm:border-l border-[var(--border)] mt-4 sm:mt-0 pt-4 sm:pt-0">
                                    {resa.statut === 'en attente' && (
                                        <CancelButton reservationId={resa.id} />
                                    )}
                                    {(resa.statut === 'validé' || resa.statut === 'validée') && (
                                        <Link href={`/materiels`} className="px-3 py-1.5 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-center transition">
                                            Voir fiche
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Informations de réservation */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {/* Badge Statut */}
                                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusStyles[resa.statut?.toLowerCase()] || "bg-gray-100 border-gray-200"}`}>
                                        {resa.statut}
                                    </span>
                                    <span className="text-xs text-[var(--text-secondary)]">
                                        #{resa.id}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-lg truncate">
                                    {resa.instruments?.name ?? "Matériel inconnu"}
                                </h3>

                                <div className="text-sm text-[var(--text-secondary)] flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-70">Du</span>
                                        <span className="font-medium text-[var(--text-primary)]">
                                            {new Date(resa.date_debut).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-70">au</span>
                                        <span className="font-medium text-[var(--text-primary)]">
                                            {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>
                                </div>

                                {/* Affichage du message s'il existe */}
                                {resa.message && (
                                    <p className="text-xs text-[var(--text-secondary)] mt-2 italic bg-slate-50 p-1.5 rounded border border-slate-100 inline-block">
                                        "{resa.message}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}