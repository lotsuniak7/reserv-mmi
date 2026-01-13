import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteInstrumentButton from "@/components/admin/DeleteInstrumentButton";
import CreateInstrumentForm from "@/components/admin/CreateInstrumentForm";
import { ArrowLeft, Package, Camera } from "lucide-react";

/**
 * Page Gestion de l'Inventaire (/admin/inventaire).
 * Permet aux administrateurs de :
 * 1. Ajouter de nouveaux objets via le formulaire (colonne gauche).
 * 2. Visualiser la liste des objets existants avec leurs images.
 * 3. Supprimer des objets.
 */
export default async function InventoryPage() {
    const supabase = await createClient();

    // Récupération de tout le matériel, du plus récent au plus ancien (par ID)
    const { data: items } = await supabase
        .from("instruments")
        .select("*")
        .order("id", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">

            {/* En-tête avec bouton retour */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Inventaire</h1>
                    <p className="text-slate-500 mt-1">Ajoutez ou supprimez du matériel du catalogue.</p>
                </div>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition"
                >
                    <ArrowLeft size={16} />
                    Retour au tableau de bord
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- COLONNE GAUCHE : Formulaire d'ajout --- */}
                {/* On utilise 'h-fit' et 'sticky' pour que le formulaire suive le scroll si la liste est longue */}
                <div className="lg:col-span-1 h-fit lg:sticky lg:top-6">
                    <CreateInstrumentForm />
                </div>

                {/* --- COLONNE DROITE : Liste du matériel --- */}
                <div className="lg:col-span-2 space-y-4">
                    {items?.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 group hover:shadow-md hover:border-indigo-100 transition duration-200">

                            {/* Image Miniature */}
                            <div className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                                {item.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    // Fallback si pas d'image
                                    <Camera className="text-slate-300" size={24} />
                                )}
                            </div>

                            {/* Informations */}
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-lg text-slate-800 truncate">{item.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                        {item.categorie}
                                    </span>
                                    {/* Optionnel : Afficher la quantité si tu gères le stock > 1 */}
                                    <span className="text-xs text-slate-400">
                                        (Ref: #{item.id})
                                    </span>
                                </div>
                            </div>

                            {/* Actions (Bouton Supprimer) */}
                            <div className="pl-2">
                                <DeleteInstrumentButton id={item.id} />
                            </div>
                        </div>
                    ))}

                    {/* État vide */}
                    {(!items || items.length === 0) && (
                        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                <Package className="text-slate-300" size={24} />
                            </div>
                            <p className="text-slate-500 font-medium">L'inventaire est vide.</p>
                            <p className="text-slate-400 text-sm">Utilisez le formulaire pour ajouter le premier objet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}