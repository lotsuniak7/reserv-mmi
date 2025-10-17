// En-tête de la page (titre + bouton pour changer le thème)

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function Header() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set() {}, remove() {},
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    async function signOut() {
        "use server";
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name, value, options) { cookieStore.set(name, value, options); },
                    remove(name, options) { cookieStore.set(name, "", { ...options, maxAge: 0 }); },
                },
            }
        );
        await supabase.auth.signOut();
    }

    return (
        <header className="flex items-center justify-between pb-4 mb-6 border-b" style={{borderColor:"var(--border)"}}>
            <div className="text-xl font-semibold">MMI Dijon — Réservation</div>

            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <span className="text-sm text-[var(--text-secondary)]">{user.user_metadata?.full_name ?? user.email}</span>
                        <LogoutButton action={signOut} />
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Link href="/auth/login" className="px-3 py-2 card hover:opacity-90">Se connecter</Link>
                        <Link href="/auth/signup" className="px-3 py-2 card hover:opacity-90">S’inscrire</Link>
                    </div>
                )}
            </div>
        </header>
    );
}