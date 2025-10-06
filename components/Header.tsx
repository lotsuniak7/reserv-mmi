"use client";

export default function Header() {
    function toggleTheme() {
        const root = document.documentElement;
        const dark = root.getAttribute("data-theme") === "dark";
        if (dark) { root.removeAttribute("data-theme"); localStorage.removeItem("theme"); }
        else { root.setAttribute("data-theme","dark"); localStorage.setItem("theme","dark"); }
    }

    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("theme");
        if (saved) document.documentElement.setAttribute("data-theme", saved);
    }

    return (
        <header className="flex items-center justify-between pb-4 mb-6 border-b" style={{borderColor:"var(--border)"}}>
            <div className="text-xl font-semibold">MMI Dijon — Réservation</div>
            <button onClick={toggleTheme} className="px-3 py-2 card hover:opacity-90">Thème</button>
        </header>
    );
}