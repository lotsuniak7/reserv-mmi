import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import LogoutButton from "@/components/auth/LogoutButton";
import CartLink from "@/components/CartLink"; // <--- Импортируем наш компонент

export default async function Header() {
    const cookieStore = await cookies();
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
        const cookieStore = await cookies();
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
        <div className="ml-auto flex items-center justify-end gap-4">
            {/* Вставляем нашу кнопку корзины */}
            <CartLink />

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <span className="text-sm text-[var(--text-secondary)]">
                {user ? (user.user_metadata?.full_name ?? user.email) : "Utilisateur"}
            </span>
            {user && <LogoutButton action={signOut} />}
        </div>
    );
}