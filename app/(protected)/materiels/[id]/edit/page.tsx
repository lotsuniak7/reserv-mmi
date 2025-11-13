"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditPage({ params }: { params: { id: string } }) {
    const id = Number(params.id);
    const supabase = createClient();
    const router = useRouter();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [caracs, setCaracs] = useState('{"Marque":"Canon"}'); // пример JSON

    async function handleUpload() {
        if (!imageFile) return;
        const path = `${id}/${Date.now()}_${imageFile.name}`;
        const { data, error } = await supabase.storage.from("instruments").upload(path, imageFile, { upsert: true });
        if (error) return alert(error.message);
        const { data: pub } = supabase.storage.from("instruments").getPublicUrl(data.path);
        setImageUrl(pub.publicUrl);
    }

    async function save() {
        let parsed: any = {};
        try { parsed = caracs ? JSON.parse(caracs) : {}; } catch { return alert("JSON invalide"); }

        const { error } = await supabase
            .from("instruments")
            .update({ image_url: imageUrl || null, description: description || null, caracteristiques: parsed })
            .eq("id", id);

        if (error) return alert(error.message);
        router.push(`/materiels/${id}`);
    }

    return (
        <div className="card p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Éditer le matériel #{id}</h1>

            <div className="space-y-1">
                <label className="text-sm">Image (upload vers Storage)</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                <button onClick={handleUpload} className="px-3 py-2 card hover:opacity-90">Uploader</button>
                {imageUrl && <div className="text-xs text-[var(--text-secondary)] break-all">{imageUrl}</div>}
            </div>

            <div className="space-y-1">
                <label className="text-sm">Description</label>
                <textarea className="border rounded-md px-3 py-2 w-full min-h-[100px]"
                          value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-1">
                <label className="text-sm">Caractéristiques (JSON)</label>
                <textarea className="border rounded-md px-3 py-2 w-full min-h-[120px]"
                          value={caracs} onChange={(e) => setCaracs(e.target.value)} />
                <p className="text-xs text-[var(--text-secondary)]">Ex: {"{ \"Capteur\": \"CMOS\", \"Poids\": \"650 g\" }"}</p>
            </div>

            <div className="flex gap-3">
                <button onClick={save}
                        className="px-4 py-2 rounded-lg text-white"
                        style={{ background: "var(--primary)" }}>
                    Enregistrer
                </button>
                <button onClick={() => router.back()} className="px-4 py-2 card hover:opacity-90">Annuler</button>
            </div>
        </div>
    );
}