import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, AlertCircle, Package, ArrowRight } from "lucide-react";

/**
 * Page : Mes Réservations.
 * Affiche l'historique complet des demandes de l'utilisateur connecté.
 * Les données sont structurées par "Dossier" (Request) contenant plusieurs "Lignes" (Reservations).
 */
export default async function MesReservationsPage() {
    const supabase = await createClient();

    // 1. Vérification de sécurité
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 2. Récupération des données avec jointures imbriquées (Nested Joins)
    // On récupère : Les Dossiers -> Les Réservations dedans -> Les Infos de l'instrument associé
    const { data: requests, error } = await supabase
        .from("requests")
        .select(`
            id,
            created_at,
            message,
            reservations (
                id,
                date_debut,
                date_fin,
                statut,
                message,
                instruments (
                    name,
                    image_url
                )
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // Les plus récentes en premier

    if (error) {
        return <div className="p-6 text-red-600">Erreur de chargement : {error.message}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">

            {/* En-tête de la page */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mes demandes</h1>
                    <p className="text-slate-500 text-sm mt-1">Suivez l'état de vos emprunts en temps réel.</p>
                </div>
                <Link
                    href="/catalogue"
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm shadow-sm"
                >
                    <Package size={16} />
                    Nouvelle demande
                </Link>
            </div>

            {/* Liste des dossiers */}
            <div className="space-y-8">
                {requests?.map((req) => (
                    <div key={req.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition duration-300">

                        {/* En-tête du dossier (Date + Message global) */}
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-2">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                <span className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-xs text-slate-500">
                                    #{req.id}
                                </span>
                                <span>Demande du {new Date(req.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            {req.message && (
                                <div className="text-sm text-slate-500 italic bg-white px-3 py-1 rounded border border-slate-100">
                                    Note : "{req.message}"
                                </div>
                            )}
                        </div>

                        {/* Liste des articles dans ce dossier */}
                        <div className="divide-y divide-slate-100">
                            {req.reservations.map((resa: any) => (
                                <div key={resa.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">

                                    {/* Image du produit */}
                                    <div className="w-16 h-12 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200 relative">
                                        {resa.instruments?.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={resa.instruments.image_url}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                alt={resa.instruments?.name}
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center text-slate-300">
                                                <Package size={16} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Détails de la réservation */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 text-sm truncate">{resa.instruments?.name || "Matériel inconnu"}</div>

                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                            <Calendar size={12} />
                                            <span>
                                                {new Date(resa.date_debut).toLocaleDateString("fr-FR")}
                                                <span className="mx-1">➜</span>
                                                {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>

                                        {/* Affichage du motif de refus si l'admin a laissé un message */}
                                        {resa.statut === 'refusée' && resa.message && (
                                            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                <span className="font-medium">Refus :</span> {resa.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Badge de Statut */}
                                    <div className="shrink-0 mt-2 sm:mt-0">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                            resa.statut === 'en attente' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                resa.statut === 'validée' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                            {resa.statut === 'en attente' && <span className="mr-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>}
                                            {resa.statut}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* État vide (Aucune commande) */}
                {(!requests || requests.length === 0) && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Aucune demande pour le moment</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                            Consultez le catalogue pour réserver votre premier équipement.
                        </p>
                        <Link href="/catalogue" className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
                            Voir le catalogue <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}