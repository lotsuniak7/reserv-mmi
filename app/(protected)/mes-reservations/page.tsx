import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, AlertCircle, Package, ArrowLeft } from "lucide-react";
import CancelRequestButton from "@/components/CancelRequestButton";

/**
 * Page : Mes Réservations.
 * Affiche l'historique complet des demandes de l'utilisateur connecté.
 * Comprend le filtrage automatique des dossiers vides après annulation.
 */
export default async function MesReservationsPage() {
    const supabase = await createClient();

    // 1. Vérification de sécurité
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 2. Récupération des données (Trié par défaut du plus récent au plus ancien)
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
        .order("created_at", { ascending: false }); // Toujours les plus récents en premier

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg m-6">
                <p className="font-bold flex items-center gap-2"><AlertCircle size={20}/> Erreur de chargement</p>
                <p className="text-sm mt-1">{error.message}</p>
            </div>
        );
    }

    // 3. Filtrage local : On cache les demandes qui n'ont plus de réservations (suite à une suppression)
    const validRequests = requests?.filter(req => req.reservations && req.reservations.length > 0) || [];

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">

            {/* EN-TÊTE SIMPLE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes demandes</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Suivez l'état de validation de vos emprunts.
                    </p>
                </div>

                <Link
                    href="/catalogue"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium text-sm shadow-sm"
                >
                    <Package size={18} />
                    Nouvelle demande
                </Link>
            </div>

            {/* LISTE DES DOSSIERS */}
            <div className="space-y-8">
                {validRequests.map((req) => {
                    // On récupère les IDs de toutes les réservations "en attente" de ce dossier
                    // pour les passer au bouton d'annulation globale
                    const pendingIds = req.reservations
                        .filter((r: any) => r.statut === 'en attente')
                        .map((r: any) => r.id);

                    return (
                        <div key={req.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition duration-300">

                            {/* HEADER DU DOSSIER */}
                            <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-500 font-bold shadow-sm">
                                        #{req.id.toString().padStart(4, '0')}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        Demande du {new Date(req.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                {req.message && (
                                    <div className="text-xs text-slate-500 italic bg-white px-3 py-1.5 rounded-lg border border-slate-200 max-w-md truncate">
                                        Note: "{req.message}"
                                    </div>
                                )}
                            </div>

                            {/* CONTENU (LISTE DES ITEMS) */}
                            <div className="divide-y divide-slate-100">
                                {req.reservations.map((resa: any) => (
                                    <div key={resa.id} className="p-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center group hover:bg-slate-50/30 transition-colors">

                                        {/* Image */}
                                        <div className="w-16 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
                                            {resa.instruments?.image_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={resa.instruments.image_url}
                                                    className="w-full h-full object-cover"
                                                    alt={resa.instruments?.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full grid place-items-center text-slate-300">
                                                    <Package size={16} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Infos */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-800 text-sm truncate">
                                                {resa.instruments?.name || "Matériel inconnu"}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                <Calendar size={12} className="text-indigo-500" />
                                                <span>
                                                    {new Date(resa.date_debut).toLocaleDateString("fr-FR")}
                                                    <span className="mx-1 text-slate-300">➜</span>
                                                    {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                                </span>
                                            </div>

                                            {/* Motif de refus */}
                                            {resa.statut === 'refusée' && resa.message && (
                                                <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                                    <AlertCircle size={12} /> Refus : {resa.message}
                                                </div>
                                            )}
                                        </div>

                                        {/* Statut (Aligné à droite proprement) */}
                                        <div className="shrink-0">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                resa.statut === 'en attente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    resa.statut === 'validée' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {resa.statut === 'en attente' && <span className="mr-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>}
                                                {resa.statut}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER AVEC ACTION (Visible seulement si on a des trucs à annuler) */}
                            {pendingIds.length > 0 && (
                                <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
                                    <CancelRequestButton reservationIds={pendingIds} />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ÉTAT VIDE */}
                {(!validRequests || validRequests.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                        <div className="w-16 h-16 bg-white border border-slate-200 text-slate-300 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Aucune demande trouvée</h3>
                        <Link
                            href="/catalogue"
                            className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm text-sm font-bold"
                        >
                            <ArrowLeft size={16} />
                            Retour au catalogue
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}