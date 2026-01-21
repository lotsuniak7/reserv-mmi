import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
// Nouveaux imports pour l'écran de verrouillage
import { Lock } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();

    // Initialisation du client Supabase côté serveur
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {}
                },
            },
        }
    );

    // Vérification de la session utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // --- DÉBUT DE LA LOGIQUE DE VÉRIFICATION (Approbation) ---
    // On récupère le statut 'is_approved' du profil utilisateur
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

    // --- BLOC DE DÉBOGAGE (À supprimer en production si nécessaire) ---
    console.log("🔍 DEBUG LAYOUT:");
    console.log("ID Utilisateur :", user.id);
    console.log("Données du profil :", profile);
    // ------------------------------------------------------------------

    // Si le profil n'existe pas (erreur) ou s'il n'est pas approuvé par un admin
    if (!profile || !profile.is_approved) {

        // Server Action : Fonction de déconnexion pour l'utilisateur bloqué
        const signOut = async () => {
            "use server";
            const cookieStore = await cookies();
            const sb = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll(); },
                        setAll(cookiesToSet) {
                            try {
                                cookiesToSet.forEach(({ name, value, options }) =>
                                    cookieStore.set(name, value, options)
                                );
                            } catch {}
                        },
                    },
                }
            );
            await sb.auth.signOut();
            redirect("/auth/login");
        };

        // Affichage de l'écran de verrouillage (Lock Screen)
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <Lock size={32} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-800">Compte en attente</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Votre inscription est prise en compte. L'accès au catalogue est restreint jusqu'à la validation par un administrateur.
                        </p>
                    </div>

                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                        📧 Vous recevrez un e-mail dès que votre accès sera débloqué.
                    </div>

                    <div className="pt-2">
                        <LogoutButton action={signOut} />
                    </div>
                </div>
            </div>
        );
    }
    // --- FIN DE LA LOGIQUE DE VÉRIFICATION ---


    // Si le compte est approuvé : On affiche la mise en page principale (Layout)
    // Récupération du rôle utilisateur depuis les métadonnées
    const userRole = user.user_metadata?.role;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Transmission du rôle à la Sidebar pour l'affichage conditionnel */}
            <Sidebar role={userRole} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 border-b p-6" style={{ borderColor: "var(--border)" }}>
                    <Header />
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}