import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { items } from "@/lib/bulk";

/**
 * Route Seed (/api/instruments/seed).
 * ATTENTION : Route utilitaire pour l'initialisation de la base de données.
 * Importe en masse les données depuis le fichier statique 'lib/bulk.ts'.
 */

// On recrée un client Admin ici localement si tu n'as pas de helper dédié
// (Ou utilise ton getSupabaseAdmin si tu l'as gardé)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    // Sécurité basique : on vérifie qu'il y a des données
    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ ok: false, error: "Aucune donnée source trouvée." }, { status: 400 });
    }

    // Préparation des données
    const payload = items.map((i) => ({
        ...i,
        status: "dispo" // Valeur par défaut
    }));

    // Upsert : Insère ou Met à jour si le nom existe déjà
    const { data, error } = await supabaseAdmin
        .from("instruments")
        .upsert(payload, { onConflict: "name" })
        .select("id, name");

    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        ok: true,
        message: "Importation réussie",
        imported_count: data?.length ?? 0
    });
}