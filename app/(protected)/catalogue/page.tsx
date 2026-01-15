import CatalogueToolbar, { InstrumentLite } from "@/components/CatalogueToolbar";
import { createClient } from "@/lib/supabase/server";

/**
 * Page Catalogue (Serveur).
 * Charge les instruments et calcule leur disponibilité en temps réel.
 * CORRECTION : Format de date européen + Sécurisation du calcul de stock (fallback à 1 si null).
 */
export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ start?: string, end?: string }> }) {
    const supabase = await createClient();
    const params = await searchParams;

    // 1. Définition de la période de vérification
    // Si l'utilisateur a filtré par date via l'URL, on prend ces dates.
    // Sinon, on vérifie la disponibilité pour "Maintenant" (Aujourd'hui -> Demain).
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const queryStart = params.start || today;
    const queryEnd = params.end || tomorrow;

    // 2. Chargement de TOUS les instruments actifs
    // On ne récupère que ceux qui sont théoriquement en service ("dispo").
    const { data: allInstruments, error } = await supabase
        .from("instruments")
        .select("id, name, status, categorie, quantite, image_url, description")
        .eq("status", "dispo")
        .order("name", { ascending: true });

    if (error) return <div className="p-6 text-red-600">Erreur de chargement : {error.message}</div>;

    // 3. Récupération des conflits (Réservations actives sur la période)
    // On cherche tout ce qui chevauche la période [queryStart, queryEnd]
    const { data: conflicts } = await supabase
        .from("reservations")
        .select("instrument_id, quantity")
        .neq("statut", "refusée")    // On ignore les refus
        .neq("statut", "terminée")   // On ignore les retours terminés (stock rendu)
        .lte("date_debut", queryEnd) // La résa commence AVANT la fin de ma recherche
        .gte("date_fin", queryStart); // La résa finit APRÈS le début de ma recherche

    // 4. Calcul du stock réel (Map : ID -> Quantité occupée)
    const reservedMap: Record<number, number> = {};

    if (conflicts) {
        conflicts.forEach((c) => {
            // SÉCURITÉ : Si la quantité est null ou 0 dans la résa (bug possible), on compte au moins 1.
            const qty = (c.quantity && c.quantity > 0) ? c.quantity : 1;
            reservedMap[c.instrument_id] = (reservedMap[c.instrument_id] || 0) + qty;
        });
    }

    // 5. Construction de la liste finale avec le stock ajusté
    const items = (allInstruments ?? []).map((inst) => {
        // Quantité physique totale (Par défaut 1 si non défini)
        const totalPhysical = inst.quantite ?? 1;

        // Quantité occupée sur la période
        const occupied = reservedMap[inst.id] || 0;

        // Quantité réellement disponible (ne peut pas être négative)
        const available = Math.max(0, totalPhysical - occupied);

        return {
            ...inst,
            // C'EST ICI QUE LA MAGIE OPÈRE :
            // On remplace la quantité totale par la quantité disponible.
            quantite: available,

            // Si 0 disponible, on force le statut visuel à "indisponible"
            status: available === 0 ? "indisponible" : inst.status
        } as InstrumentLite;
    });

    // 6. Extraction des catégories pour les filtres
    const categories = Array.from(new Set(items.map((i) => i.categorie).filter((x): x is string => !!x))).sort();

    // 7. Formatage propre des dates pour l'affichage (JJ/MM/AAAA)
    // On utilise 'fr-FR' pour forcer le format européen
    const formatDateEu = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catalogue</h1>
                <p className="text-slate-500">
                    Réservez le matériel audiovisuel du MMI Dijon.
                    {params.start && params.end && (
                        <span className="ml-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-bold border border-indigo-100">
                            Disponibilité du {formatDateEu(params.start)} au {formatDateEu(params.end)}
                        </span>
                    )}
                </p>
            </div>

            {/* On passe les items avec le stock DÉJÀ CALCULÉ */}
            <CatalogueToolbar items={items} categories={categories} />
        </div>
    );
}