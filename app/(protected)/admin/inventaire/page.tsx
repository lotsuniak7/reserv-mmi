import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InventoryDashboard from "@/components/admin/InventoryDashboard"; // Import du nouveau composant

/**
 * Page Gestion de l'Inventaire (/admin/inventaire).
 * Permet aux administrateurs de gérer le stock.
 * Utilise un composant client (InventoryDashboard) pour le filtrage, la recherche et l'édition.
 */
export default async function InventoryPage() {
    const supabase = await createClient();

    // Récupération de tout le matériel, trié par nom pour plus de clarté
    const { data: items } = await supabase
        .from("instruments")
        .select("*")
        .order("id", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">

            {/* En-tête avec bouton retour (Intouché) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Inventaire</h1>
                    <p className="text-slate-500 mt-1">Ajoutez, modifiez ou supprimez du matériel du catalogue.</p>
                </div>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition"
                >
                    <ArrowLeft size={16} />
                    Retour au tableau de bord
                </Link>
            </div>

            {/* Corps de page : Tableau de bord interactif */}
            <InventoryDashboard initialItems={items || []} />

        </div>
    );
}