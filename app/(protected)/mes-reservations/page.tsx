import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MesReservationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // Загружаем папки пользователя
    const { data: requests } = await supabase
        .from("requests")
        .select(`
            *,
            reservations (
                *,
                instruments ( name, image_url )
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            <div className="flex justify-between items-center border-b pb-6">
                <h1 className="text-3xl font-bold">Mes demandes</h1>
                <Link href="/" className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition font-medium text-sm">
                    + Nouvelle demande
                </Link>
            </div>

            <div className="space-y-8">
                {requests?.map((req) => (
                    <div key={req.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        {/* Заголовок папки */}
                        <div className="bg-slate-50 p-4 border-b border-slate-100">
                            <span className="font-bold text-slate-700">Demande du {new Date(req.created_at).toLocaleDateString()}</span>
                            {req.message && <p className="text-sm text-slate-500 italic mt-1">Votre note : "{req.message}"</p>}
                        </div>

                        {/* Список предметов внутри */}
                        <div className="divide-y divide-slate-100">
                            {req.reservations.map((resa: any) => (
                                <div key={resa.id} className="p-4 flex gap-4 items-center">
                                    <div className="w-16 h-12 bg-slate-100 rounded overflow-hidden shrink-0">
                                        {resa.instruments?.image_url &&
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={resa.instruments.image_url} className="w-full h-full object-cover" alt=""/>
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{resa.instruments?.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(resa.date_debut).toLocaleDateString("fr-FR")} - {new Date(resa.date_fin).toLocaleDateString("fr-FR")}
                                        </div>
                                        {/* Если админ отказал и написал причину */}
                                        {resa.statut === 'refusée' && resa.message && (
                                            <div className="text-xs text-red-600 font-medium mt-1 bg-red-50 px-2 py-1 rounded inline-block">
                                                Refus : {resa.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Статус бейдж */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        resa.statut === 'en attente' ? 'bg-amber-100 text-amber-700' :
                                            resa.statut === 'validée' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>
                                        {resa.statut}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {(!requests || requests.length === 0) && (
                    <div className="text-center py-12 text-slate-400">Aucune demande pour le moment.</div>
                )}
            </div>
        </div>
    );
}