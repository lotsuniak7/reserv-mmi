import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar />

            {/* ГЛАВНОЕ: отступ слева md:ml-[260px] чтобы не перекрывать */}
            <div className="md:ml-[260px]">
                <main className="p-6">
                    <Header />
                    <div className="mt-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}