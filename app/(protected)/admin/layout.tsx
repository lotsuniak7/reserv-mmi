import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Жесткая проверка: если не админ — на выход
    if (!user || user.user_metadata?.role !== 'admin') {
        redirect("/");
    }

    return <>{children}</>;
}