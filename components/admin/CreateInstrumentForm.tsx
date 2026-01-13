"use client";

import { createInstrument } from "@/app/actions";
import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

/**
 * Formulaire de création d'instrument (Côté Client).
 * Permet à l'administrateur d'ajouter un nouvel objet dans la base de données.
 * Gère l'upload d'image (prévisualisation locale) et l'appel au Server Action.
 */
export default function CreateInstrumentForm() {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Références pour manipuler le formulaire et l'input fichier directement
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Gestion de la prévisualisation d'image (Blob URL)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    // Suppression de l'image sélectionnée (avant envoi)
    const handleClearImage = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Soumission du formulaire
    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await createInstrument(formData);
        setLoading(false);

        if (res?.error) {
            alert("Erreur : " + res.error);
        } else {
            // Réinitialisation complète du formulaire après succès
            formRef.current?.reset();
            setPreviewUrl(null);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
            <h2 className="font-bold text-lg mb-4 text-slate-900">Ajouter un matériel</h2>

            <form ref={formRef} action={handleSubmit} className="space-y-5">

                {/* --- 1. Zone Image --- */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Image du produit</label>

                    <div className="relative">
                        {previewUrl ? (
                            // Cas 1 : Une image est sélectionnée -> On l'affiche
                            <div className="relative w-full h-48 bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleClearImage}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-slate-600 hover:text-red-600 hover:bg-white transition shadow-sm"
                                    title="Supprimer l'image"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            // Cas 2 : Pas d'image -> Zone d'upload
                            <label
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition group"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-2 bg-white rounded-full mb-2 shadow-sm group-hover:scale-110 transition">
                                        <Upload className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <p className="text-xs text-slate-500 text-center px-4">
                                        <span className="font-semibold text-slate-700">Cliquez</span> ou glissez une image
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
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

                {/* --- 2. Nom --- */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nom du produit</label>
                    <input
                        name="name"
                        type="text"
                        placeholder="Ex: Canon EOS 50D"
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                </div>

                {/* --- 3. Catégorie --- */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Catégorie</label>
                    <div className="relative">
                        <select
                            name="categorie"
                            className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        >
                            <option value="Cameras">Caméras</option>
                            <option value="Audio">Audio</option>
                            <option value="Lumiere">Lumière</option>
                            <option value="Accessoires">Accessoires</option>
                        </select>
                        {/* Petite flèche custom pour le select */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>

                {/* --- 4. Description --- */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="État, accessoires inclus..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                    />
                </div>

                {/* --- Bouton Submit --- */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Ajout en cours...
                        </>
                    ) : (
                        "Ajouter au stock"
                    )}
                </button>
            </form>
        </div>
    );
}