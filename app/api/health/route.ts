import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route API System Health Check (/api/health).
 * Permet de vérifier rapidement si la connexion à la base de données est opérationnelle.
 * Utile pour le monitoring ou le débogage en production.
 */
export async function GET() {
    const supabase = await createClient();

    // On essaie de compter les lignes (opération légère) pour tester la connexion
    const { count, error } = await supabase
        .from("instruments")
        .select("id", { head: true, count: "exact" });

    if (error) {
        return NextResponse.json(
            { ok: false, status: "Database Error", message: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        ok: true,
        status: "Healthy",
        instruments_count: count ?? 0
    });
}