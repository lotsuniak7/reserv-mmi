import MaterialCard from "@/components/MaterialCard";
import { createClient } from "@/lib/supabase/server";

type Instrument = { id: number; name: string; status: string; };

export default async function Page() {
  const supabase = await createClient();

  const { data, error } = await supabase
      .from("instruments")
      .select("id,name,status")
      .order("id", { ascending: true });

  if (error) {
    return (
        <div className="card p-4">
          <div className="font-semibold mb-2">Erreur de chargement</div>
          <pre className="text-sm text-red-600">{error.message}</pre>
          <p className="text-sm opacity-70 mt-2">
              Vérifiez .env et le tableau <code>instruments</code>.
          </p>
        </div>
    );
  }

  const items = (data ?? []) as Instrument[];

  return (
      <>
        <h1 className="text-2xl font-bold mb-4">Catalogue des Matériels</h1>
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {items.length === 0 ? (
              <div className="card p-4 col-span-full text-sm">
                  La base est vide. Ajoute des entrées dans <b>instruments</b>.
              </div>
          ) : (
              items.map((it) => <MaterialCard key={it.id} {...it} />)
          )}
        </div>
      </>
  );
}