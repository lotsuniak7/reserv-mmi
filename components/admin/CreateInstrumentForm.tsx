"use client";

import { createInstrument } from "@/app/actions"; // Assure-toi que le chemin est bon
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

export default function CreateInstrumentForm() {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Gère l'affichage de la prévisualisation quand on choisit un fichier
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await createInstrument(formData);
        setLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            // Reset du formulaire après succès
            formRef.current?.reset();
            setPreviewUrl(null);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit sticky top-6">
            <h2 className="font-bold text-lg mb-4">Ajouter un matériel</h2>

            <form ref={formRef} action={handleSubmit} className="space-y-4">

                {/* Champ Image (Zone de clic) */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Image</label>

                    <div className="relative">
                        {/* Si une image est choisie, on l'affiche */}
                        {previewUrl ? (
                            <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        // Reset de l'input file (un peu hacky mais fonctionnel)
                                        const input = document.getElementById('file-upload') as HTMLInputElement;
                                        if(input) input.value = "";
                                    }}
                                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-slate-600 hover:text-red-500 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            // Sinon, on affiche la zone d'upload
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition hover:border-indigo-400 group"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-indigo-500 transition" />
                                    <p className="text-xs text-slate-500 text-center px-2">
                                        <span className="font-semibold">Cliquez pour ajouter</span> ou glissez une image
                                    </p>
                                </div>
                                <input
                                    id="file-upload"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Nom */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nom du produit</label>
                    <input
                        name="name"
                        type="text"
                        placeholder="Ex: Canon EOS 50D"
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                </div>

                {/* Catégorie */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Catégorie</label>
                    <select
                        name="categorie"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                        <option value="Cameras">Caméras</option>
                        <option value="Audio">Audio</option>
                        <option value="Lumiere">Lumière</option>
                        <option value="Accessoires">Accessoires</option>
                    </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="État, détails..."
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                    />
                </div>

                {/* Bouton Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            Ajout...
                        </>
                    ) : (
                        "Ajouter au stock"
                    )}
                </button>
            </form>
        </div>
    );
}