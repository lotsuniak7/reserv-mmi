import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Layout Admin (AdminLayout).
 * Agit comme un "Middleware" de sécurité spécifique pour le dossier /admin.
 * Vérifie strictement si l'utilisateur possède le rôle 'admin'.
 * Si ce n'est pas le cas, il est redirigé vers l'espace étudiant.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Sécurité : Si l'utilisateur n'est pas connecté ou n'est pas admin
    // Note : On vérifie 'user_metadata' car c'est rapide (contenu dans la session)
    if (!user || user.user_metadata?.role !== 'admin') {
        // On redirige les curieux (ou les étudiants perdus) vers le catalogue
        redirect("/catalogue");
    }

    // Si tout est bon, on affiche la page admin demandée
    return <>{children}</>;
}