import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Page d'Inscription (Signup).
 * Crée un nouvel utilisateur dans Supabase Auth et déclenche le trigger SQL de création de profil.
 */
export default async function SignupPage(props: Props) {
    const searchParams = await props.searchParams;
    const errorMessage = searchParams?.error;

    /**
     * Server Action : Gère la création du compte.
     */
    async function signUp(formData: FormData) {
        "use server";

        const full_name = String(formData.get("full_name") || "");
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        if (!email || !password || !full_name) {
            redirect(`/auth/signup?error=${encodeURIComponent("Tous les champs sont requis.")}`);
        }

        const supabase = await createClient();

        // Inscription de l'utilisateur
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Ces métadonnées seront copiées dans la table 'profiles' grâce à notre trigger SQL
                data: {
                    full_name: full_name,
                    role: "etudiant" // Rôle par défaut
                }
            },
        });

        if (error) {
            redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
        }

        // Si l'inscription réussit, on redirige vers le login (ou vers une page "Vérifiez vos emails")
        redirect("/auth/login?error=" + encodeURIComponent("Compte créé ! Connectez-vous."));
    }

    return (
        <form action={signUp} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
                <p className="text-sm text-slate-500 mt-2">Rejoignez le département MMI</p>
            </div>

            {errorMessage && (
                <div className="p-3 rounded-md text-sm bg-blue-50 text-blue-700 border border-blue-200 text-center">
                    {errorMessage}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nom complet</label>
                <input
                    name="full_name"
                    type="text"
                    placeholder="Jean Dupont"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    required
                />
            </div>

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
                S’inscrire
            </button>

            <p className="text-center text-sm text-slate-500">
                Déjà un compte ? <Link href="/auth/login" className="text-indigo-600 hover:underline font-medium">Se connecter</Link>
            </p>
        </form>
    );
}