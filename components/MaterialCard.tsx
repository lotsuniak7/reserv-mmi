import Link from "next/link";

type Props = { id: number; name: string; status: string; };

const statusMap: Record<string, { text: string; className: string }> = {
    available:   { text: "Disponible",   className: "bg-green-100 text-green-600" },
    reserved:    { text: "Réservé",      className: "bg-amber-100 text-amber-600" },
    unavailable: { text: "Indisponible", className: "bg-red-100 text-red-600" },
};

export default function MaterialCard({ id, name, status }: Props) {
    const st = statusMap[status] ?? { text: status, className: "bg-gray-100 text-gray-600" };
    return (
        <Link href={`/materiels/${id}`} className="block">
            <article className="card p-4 hover:shadow transition">
                <div className="h-40 mb-3 rounded" style={{ background: "var(--surface)" }} />
                <h3 className="font-semibold">{name}</h3>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-sm ${st.className}`}>
          {st.text}
        </span>
            </article>
        </Link>
    );
}