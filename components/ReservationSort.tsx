"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ReservationSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "desc"; // Par défaut : plus récent en premier

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        router.push(`/mes-reservations?sort=${val}`);
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-secondary)]">Trier par :</span>
            <select
                value={currentSort}
                onChange={handleChange}
                className="border border-[var(--border)] rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
                <option value="desc">Date (Plus récent)</option>
                <option value="asc">Date (Plus ancien)</option>
            </select>
        </div>
    );
}