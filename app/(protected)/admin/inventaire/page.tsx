import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteInstrumentButton from "@/components/admin/DeleteInstrumentButton";
import CreateInstrumentForm from "@/components/admin/CreateInstrumentForm";

export default async function InventoryPage() {
    const supabase = await createClient();

    const { data: items } = await supabase
        .from("instruments")
        .select("*")
        .order("id", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold">Inventaire</h1>
                    <Link href="/admin" className="text-sm text-[var(--text-secondary)] hover:underline">
                        ← Retour au tableau de bord
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ЛЕВАЯ КОЛОНКА: Форма (импортированный компонент) */}
                <div className="lg:col-span-1">
                    <CreateInstrumentForm />
                </div>

                {/* ПРАВАЯ КОЛОНКА: Список */}
                <div className="lg:col-span-2 space-y-4">
                    {items?.map((item) => (
                        <div key={item.id} className="card p-4 flex items-center gap-4 group bg-white border hover:shadow-sm transition">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border flex-shrink-0 relative">
                                {item.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-xs text-gray-400">IMG</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-lg truncate">{item.name}</div>
                                <div className="text-xs text-[var(--text-secondary)] bg-slate-100 px-2 py-0.5 rounded inline-block">
                                    {item.categorie}
                                </div>
                            </div>

                            {/* Кнопка удаления (импортированный компонент) */}
                            <DeleteInstrumentButton id={item.id} />
                        </div>
                    ))}

                    {(!items || items.length === 0) && (
                        <div className="text-center text-gray-500 py-10">
                            Inventaire vide.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}