"use client";

import { createInstrument } from "@/app/actions";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";

export default function CreateInstrumentForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        await createInstrument(formData);
        setLoading(false);
        formRef.current?.reset(); // Очищаем форму после отправки
    }

    return (
        <div className="card p-6 bg-white border shadow-sm sticky top-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus size={20} /> Ajouter un matériel
            </h2>
            <form ref={formRef} action={handleSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Nom</label>
                    <input name="name" required placeholder="Ex: Canon 5D" className="w-full border rounded p-2 text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Catégorie</label>
                    <input name="categorie" placeholder="Ex: Vidéo" className="w-full border rounded p-2 text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Image URL</label>
                    <input name="image_url" placeholder="https://..." className="w-full border rounded p-2 text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Description</label>
                    <textarea name="description" rows={3} className="w-full border rounded p-2 text-sm bg-slate-50" />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-70"
                >
                    {loading ? "Création..." : "Créer"}
                </button>
            </form>
        </div>
    );
}