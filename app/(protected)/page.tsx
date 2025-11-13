// Catalogue avec recherche et filtre par catégorie
import CatalogueToolbar, { InstrumentLite } from "@/components/CatalogueToolbar";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("instruments")
        .select("id,name,status,categorie,quantite,image_url")
        .order("name", { ascending: true });

    if (error) {
        return (
            <div className="card p-4">
                <div className="font-semibold mb-2">Erreur de chargement</div>
                <pre className="text-sm text-red-600">{error.message}</pre>
            </div>
        );
    }

    const items = (data ?? []) as InstrumentLite[];
    const categories = Array.from(
        new Set(items.map((i) => i.categorie).filter((x): x is string => !!x))
    ).sort((a, b) => a.localeCompare(b));

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Catalogue des Matériels</h1>
            <CatalogueToolbar items={items} categories={categories} />
        </>
    );
}