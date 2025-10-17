import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { items } from "@/lib/bulk";

// Route pour insérer le matériel de lib/bulk.js dans la base Supabase

type InstrumentInput = {
    id?: number;
    name: string;
    status?: string;
    categorie?: string;
    quantite?: number;
    description?: string;
    caracteristiques?: any;
    image_url?: string;
    tuto?: string;
};

export async function GET() {
    const supabase = getSupabaseAdmin();

    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ ok: false, error: "Aucune donnée à importer." }, { status: 400 });
    }

    // по умолчанию ставим статус "available"
    const payload: InstrumentInput[] = items.map((i) => ({ ...i }));

    // upsert по уникальному полю name (см. SQL с unique index)
    const { data, error } = await supabase
        .from("instruments")
        .upsert(payload, { onConflict: "name" })
        .select("id,name");

    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: data?.length ?? 0, items: data });
}