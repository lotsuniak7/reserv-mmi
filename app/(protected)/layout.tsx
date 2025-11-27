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
        // flex-row не нужен, так как Sidebar fixed.
        <div className="min-h-screen bg-[var(--background)]">

            {/* Сайдбар фиксирован, он не занимает места в потоке */}
            <Sidebar />

            {/* ГЛАВНОЕ:
               1. md:ml-[260px] -> сдвигает весь контент вправо ровно на ширину сайдбара.
               2. min-h-screen -> растягивает контент на всю высоту.
            */}
            <div className="md:ml-[260px] min-h-screen">
                <main className="flex-1 p-6">
                    <Header />

                    {/* Контент страницы (твои материалы) */}
                    <div className="mt-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}