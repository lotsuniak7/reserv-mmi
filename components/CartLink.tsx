"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
// Иконка корзины
export default function CartLink() {
    const { cart } = useCart();

    // Показывать, даже если 0 (чтобы видеть, что работает)
    return (
        <Link
            href="/panier"
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-[var(--primary)] rounded-full text-sm font-medium hover:bg-indigo-100 transition"
        >
            <span>Réservation en cours ({cart.length})</span>
        </Link>
    );
}