"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, Filter, X, Save, Upload, Camera, CheckCircle } from "lucide-react";
import { deleteInstrument, createInstrument, updateInstrument } from "@/app/actions";
import { useRouter } from "next/navigation";

// Types
type Instrument = {
    id: number;
    name: string;
    image_url: string | null;
    categorie: string | null;
    quantite: number | null;
    description: string | null;
};

const DEFAULT_CATEGORIES = ["Caméras", "Lumière", "Audio", "Accessoires", "Régie", "Trépieds", "Informatique"];

export default function InventoryDashboard({ initialItems }: { initialItems: Instrument[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tout");

    // État du Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Instrument | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- NOUVEAU : Prévisualisation de l'image ---
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const router = useRouter();

    // Reset du preview quand on ouvre/ferme le modal
    useEffect(() => {
        if (!isModalOpen) setPreviewUrl(null);
    }, [isModalOpen]);

    // Fonction pour gérer le choix de fichier et afficher le preview immédiat
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Crée une URL temporaire locale pour afficher l'image tout de suite
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // --- 1. GÉNÉRATION DYNAMIQUE DES FILTRES ---
    const availableCategories = useMemo(() => {
        const cats = new Set(initialItems.map(i => i.categorie).filter(Boolean));
        return ["Tout", ...Array.from(cats).sort()];
    }, [initialItems]);

    // --- 2. FILTRAGE ---
    const filteredItems = initialItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const itemCat = item.categorie || "Non classé";
        const matchesCategory = selectedCategory === "Tout" || itemCat === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // --- ACTIONS ---

    const openCreateModal = () => {
        setEditingItem(null);
        setPreviewUrl(null); // Reset preview
        setIsModalOpen(true);
    };

    const openEditModal = (item: Instrument) => {
        setEditingItem(item);
        setPreviewUrl(null); // Reset preview (on affichera l'image existante par défaut)
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        let result;
        if (editingItem) {
            formData.append("id", editingItem.id.toString());
            result = await updateInstrument(formData);
        } else {
            result = await createInstrument(formData);
        }

        setIsLoading(false);

        if (result?.error) {
            alert(result.error);
        } else {
            setIsModalOpen(false);
            router.refresh();
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Supprimer cet élément définitivement ? L'image sera aussi supprimée.")) {
            await deleteInstrument(id);
            router.refresh();
        }
    };

    // Helper pour savoir quelle image afficher dans le modal
    const displayImage = previewUrl || editingItem?.image_url;

    return (
        <div className="space-y-6">

            {/* --- BARRE D'OUTILS --- */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-end md:items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">

                {/* Recherche & Filtre */}
                <div className="flex flex-1 gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>

                    <div className="relative w-40">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        >
                            {availableCategories.map((c) => (
                                // @ts-ignore
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bouton Ajouter */}
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                >
                    <Plus size={16} />
                    Ajouter
                </button>
            </div>

            {/* --- LISTE DES ÉLÉMENTS --- */}
            <div className="grid grid-cols-1 gap-3">
                {filteredItems.map((item) => (
                    <div key={item.id} className="group bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-4 hover:border-indigo-300 transition-all hover:shadow-sm">

                        {/* Image */}
                        <div className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="text-slate-300" size={20} />
                            )}
                            {/* Badge Quantité */}
                            <div className="absolute top-1 right-1 bg-white/90 backdrop-blur px-1 py-0.5 rounded text-xs font-bold border border-slate-200 shadow-sm">
                                x{item.quantite ?? 1}
                            </div>
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                    {item.categorie || "Non classé"}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-slate-500 truncate">{item.description || "—"}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                            <button
                                onClick={() => openEditModal(item)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Modifier"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-sm">
                        Aucun résultat pour cette recherche.
                    </div>
                )}
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/10">

                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingItem ? "Modifier" : "Nouvel objet"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">

                            {/* Nom */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom</label>
                                <input
                                    name="name"
                                    defaultValue={editingItem?.name}
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Catégorie */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Catégorie</label>
                                    <div className="relative">
                                        <select
                                            name="categorie"
                                            defaultValue={editingItem?.categorie || "Accessoires"}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                        >
                                            {Array.from(new Set([...DEFAULT_CATEGORIES, editingItem?.categorie].filter(Boolean))).map(c => (
                                                // @ts-ignore
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                    </div>
                                </div>

                                {/* Quantité */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantité</label>
                                    <input
                                        type="number"
                                        name="quantite"
                                        defaultValue={editingItem?.quantite || 1}
                                        min="0"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingItem?.description || ""}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition"
                                />
                            </div>

                            {/* Zone Image avec PREVIEW */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Photo</label>

                                <div className="flex gap-4 items-start">
                                    {/* Zone de preview */}
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {displayImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={displayImage} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <Camera size={20} className="text-slate-300" />
                                        )}
                                    </div>

                                    {/* Input file */}
                                    <div className="flex-1">
                                        <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-center hover:bg-slate-100 transition cursor-pointer relative group h-16 flex flex-col items-center justify-center">
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleFileChange} // <--- C'est ici que la magie opère
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition">
                                                <Upload size={16} />
                                                <span className="text-xs font-medium">
                                                    {previewUrl ? "Changer la sélection" : "Choisir un fichier"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {previewUrl && (
                                    <div className="text-[10px] text-indigo-600 mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                                        <CheckCircle size={10}/> Nouvelle image sélectionnée
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 text-sm shadow-md"
                                >
                                    {isLoading ? "Sauvegarde..." : (
                                        <>
                                            <Save size={16} />
                                            {editingItem ? "Sauvegarder" : "Créer"}
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}