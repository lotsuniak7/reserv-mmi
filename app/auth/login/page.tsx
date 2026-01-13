import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // On utilise notre helper centralisé
import Link from "next/link";

// Définition du type des props pour la compatibilité Next.js 15
type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Page de Connexion (Login).
 * Gère l'authentification des utilisateurs existants via email/mot de passe.
 */
export default async function LoginPage(props: Props) {
    // Dans Next.js 15, les paramètres d'URL sont asynchrones, il faut les attendre.
    const searchParams = await props.searchParams;
    const errorMessage = searchParams?.error;

    /**
     * Server Action : Gère la soumission du formulaire de connexion.
     * S'exécute exclusivement sur le serveur pour la sécurité.
     */
    async function signIn(formData: FormData) {
        "use server";

        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        // Validation basique côté serveur
        if (!email || !password) {
            redirect(`/auth/login?error=${encodeURIComponent("Email et mot de passe requis.")}`);
        }

        // Initialisation du client Supabase (utilise les cookies httpOnly)
        const supabase = await createClient();

        // Tentative de connexion via l'API Auth de Supabase
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            // En cas d'erreur (ex: mauvais mot de passe), on recharge la page avec le message
            redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
        }

        // Succès : Redirection vers la page d'accueil (protégée)
        redirect("/catalogue");
    }

    return (
        <form action={signIn} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
                <p className="text-sm text-slate-500 mt-2">Accédez au catalogue MMI</p>
            </div>

            {/* Affichage des erreurs s'il y en a */}
            {errorMessage && (
                <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200 text-center">
                    {errorMessage}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Adresse e-mail</label>
                <input
                    name="email"
                    type="email"
                    placeholder="prenom.nom@exemple.fr"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition shadow-md hover:shadow-lg"
            >
                Se connecter
            </button>

            <p className="text-center text-sm text-slate-500">
                Pas de compte ? <Link href="/auth/signup" className="text-indigo-600 hover:underline font-medium">S’inscrire</Link>
            </p>
        </form>
    );
}