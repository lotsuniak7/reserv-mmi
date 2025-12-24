"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";

export default function AddToCartButton({
                                            instrument,
                                            availableQty,
                                            dates
                                        }: {
    instrument: { id: number; name: string; image_url: string | null };
    availableQty: number;
    dates: { start: string; end: string } | null;
}) {
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    // Если даты не выбраны, просим выбрать
    if (!dates) {
        return (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>Veuillez sélectionner des dates dans le calendrier ci-dessus pour voir la disponibilité.</span>
            </div>
        );
    }

    // Если товара нет в наличии на эти даты
    if (availableQty <= 0) {
        return (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm text-center font-medium">
                Rupture de stock pour ces dates ❌
            </div>
        );
    }

    const handleAdd = () => {
        addToCart({
            id: instrument.id,
            name: instrument.name,
            image_url: instrument.image_url,
            quantity: qty,
            maxQuantity: availableQty, // Запоминаем макс. доступное, чтобы в корзине не увеличили лишнего
            startDate: dates.start,
            endDate: dates.end
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000); // Сбрас галочки через 2 сек
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Quantité :</label>
                <div className="flex items-center gap-2">
                    {/* Выпадающий список от 1 до availableQty */}
                    <select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="border border-slate-300 p-1.5 rounded-md w-16 text-center bg-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    >
                        {Array.from({ length: availableQty }).map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                    </select>
                    <span className="text-xs text-[var(--text-secondary)] opacity-70">
                        / {availableQty} dispo
                    </span>
                </div>
            </div>

            <button
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                    added
                        ? "bg-green-600 text-white"
                        : "bg-[var(--text-primary)] text-white hover:opacity-90"
                }`}
            >
                {added ? (
                    <><Check size={20} /> Ajouté au panier !</>
                ) : (
                    <><ShoppingCart size={20} /> Ajouter au panier</>
                )}
            </button>
        </div>
    );
}