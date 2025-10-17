import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Pour verifier la connexion à la base de données

export async function GET() {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("instruments")
        .select("id", { head: true, count: "exact" });

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, instruments: count ?? 0 });
}