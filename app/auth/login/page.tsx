// Page de connexion — simple, sans contraintes strictes
// NOTE FUTUR: ajouter Zod plus tard (email valide, mot de passe min 6).
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
    async function signIn(formData: FormData) {
        "use server";
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        if (!email || !password) {
            redirect(`/auth/login?error=${encodeURIComponent("Champs requis manquants.")}`);
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    // ✅ НОВЫЙ ПРАВИЛЬНЫЙ СПОСОБ:
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Игнорируем ошибку, если вызываем из Server Component
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
        }
        redirect("/"); // après connexion => vers la page principale protégée
    }

    return (
        <form action={signIn} className="card p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Connexion</h1>

            {searchParams?.error && (
                <div className="p-3 rounded-md text-sm" style={{ background:"#fee2e2", color:"#991b1b" }}>
                    {searchParams.error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-sm">Adresse e-mail</label>
                <input name="email" type="email" placeholder="prenom.nom@exemple.fr"
                       className="border rounded-md px-3 py-2 w-full" />
                {/* NOTE FUTUR: valider format e-mail avec Zod */}
            </div>

            <div className="space-y-1">
                <label className="text-sm">Mot de passe</label>
                <input name="password" type="password" className="border rounded-md px-3 py-2 w-full" />
                {/* NOTE FUTUR: imposer ">= 6 caractères" ici */}
            </div>

            <button type="submit"
                    className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition"
                    style={{ background:"var(--primary)" }}>
                Se connecter
            </button>

            <p className="text-sm text-[var(--text-secondary)]">
                Pas de compte ? <a href="/auth/signup" className="underline">S’inscrire</a>
            </p>
        </form>
    );
}