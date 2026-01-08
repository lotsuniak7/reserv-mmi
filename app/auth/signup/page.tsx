// Page d'inscription — sans validations strictes (tout peut faire 1 caractère)
// NOTE FUTUR: ici on pourra brancher Zod et mettre "min: 6" pour le mot de passe.
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ✅ Correction Next.js 15 : searchParams est maintenant une Promise
export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;

    async function signUp(formData: FormData) {
        "use server";
        // ⚠️ Actuellement aucune contrainte dure; on accepte >= 1 caractère.
        // TODO (plus tard): renforcer -> si longueur < 6 => afficher erreur.
        const full_name = String(formData.get("full_name") || "");
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        if (!email || !password) {
            // garde-fou minimal: champs vides
            redirect(`/auth/signup?error=${encodeURIComponent("Champs requis manquants.")}`);
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
                            // Игнорируем ошибку, если вызываем из Server Componen
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.signUp({
            email,
            password, // NOTE FUTUR: exiger "min 6" ici quand on sera prêt.
            options: { data: { role: "etudiant", full_name } }, // stocké dans user_metadata
        });

        if (error) {
            redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
        }

        // Si la confirmation e-mail est activée dans Supabase Auth:
        // l'utilisateur devra valider par mail; on renvoie vers la connexion.
        redirect("/auth/login");
    }

    return (
        <form action={signUp} className="card p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Créer un compte</h1>

            {searchParams?.error && (
                <div className="p-3 rounded-md text-sm" style={{ background:"#fee2e2", color:"#991b1b" }}>
                    {searchParams.error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-sm">Nom complet</label>
                <input name="full_name" type="text" placeholder="Jean Dupont"
                       className="border rounded-md px-3 py-2 w-full" />
                {/* NOTE FUTUR: exiger min 2 caractères ici */}
            </div>

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
                S’inscrire
            </button>

            <p className="text-sm text-[var(--text-secondary)]">
                Déjà un compte ? <a href="/auth/login" className="underline">Se connecter</a>
            </p>
        </form>
    );
}