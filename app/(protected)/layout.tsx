import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

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

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Сайдбар: на мобилке скрыт и выезжает, на дескпе в потоке */}
            <Sidebar />

            {/* Основной контент: занимает оставшееся место */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Заголовок — не прокручивается */}
                <header className="flex-shrink-0 border-b p-6" style={{ borderColor: "var(--border)" }}>
                    <Header />
                </header>

                {/* Контент страницы — прокручивается только эта часть */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}