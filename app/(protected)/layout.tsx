import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import "../globals.css";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();

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
        <div className="min-h-screen bg-[var(--background)] bg-red-200">
            <Sidebar />
            <div className="bg-teal-50 w-72 h-screen"></div>
            {/* Используем кастомный CSS класс main-content-wrapper из globals.css */}
            <div className=" bg-amber-400 ml-32 w-full h-screen">
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