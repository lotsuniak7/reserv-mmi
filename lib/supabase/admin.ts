// lib/supabase/admin.ts
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client admin Supabase (utilise la clé service_role, jamais côté client)

export function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    // ВНИМАНИЕ: service_role используем ТОЛЬКО на сервере.
    return createSupabaseClient(url, service, {
        auth: { persistSession: false },
    });
}