import Link from "next/link";
// Barre latérale - navigation principale de l’application

export default function Sidebar() {
    return (
        <aside className="w-[260px] p-6 border-r hidden md:flex flex-col gap-6"
               style={{ background:"var(--surface)", borderColor:"var(--border)" }}>
            <div className="flex items-center gap-3 pb-4 border-b" style={{borderColor:"var(--border)"}}>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-white font-bold"
                     style={{background:"linear-gradient(135deg,var(--primary),var(--secondary))"}}>MMI</div>
                <div>
                    <div className="font-semibold">MMI Dijon</div>
                    <div className="text-sm opacity-70">Réservation Matériel</div>
                </div>
            </div>

            <nav className="flex flex-col gap-2 text-sm">
                <Link href="/" className="px-3 py-2 rounded-lg hover:bg-[var(--card)]">Matériels</Link>
            </nav>

            <div className="mt-auto pt-4 border-t" style={{borderColor:"var(--border)"}}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full grid place-items-center text-white font-bold"
                         style={{background:"linear-gradient(135deg,var(--primary),var(--secondary))"}}>JD</div>
                    <div>
                        <div className="text-sm font-medium">Jean Dupont</div>
                        <div className="text-xs opacity-70">Étudiant MMI</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}