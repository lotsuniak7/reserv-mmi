import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
// Новые импорты для экрана блокировки
import { Lock } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // --- НАЧАЛО НОВОЙ ЛОГИКИ (Проверка одобрения) ---
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

    // Если профиля нет (ошибка) или он не одобрен
    if (!profile || !profile.is_approved) {
        // Функция выхода для заблокированного пользователя
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
    // --- КОНЕЦ НОВОЙ ЛОГИКИ ---


    // Если одобрен — показываем твой старый Layout
    // Получаем роль пользователя (как у тебя было)
    const userRole = user.user_metadata?.role;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Передаем роль в Sidebar */}
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