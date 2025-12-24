"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";

export default function AddToCartButton({
                                            instrument,
                                            availableQty,
                                            dates,
                                            onSuccess // <--- Новая функция обратного вызова
                                        }: {
    instrument: { id: number; name: string; image_url: string | null };
    availableQty: number;
    dates: { start: string; end: string } | null;
    onSuccess?: () => void; // <--- Тип
}) {
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    if (!dates) {
        return (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg flex gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>Sélectionnez des dates ci-dessus.</span>
            </div>
        );
    }

    if (availableQty <= 0) {
        return (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg font-medium text-center">
                Rupture de stock ❌
            </div>
        );
    }

    const handleAdd = () => {
        addToCart({
            id: instrument.id,
            name: instrument.name,
            image_url: instrument.image_url,
            quantity: qty,
            maxQuantity: availableQty,
            startDate: dates.start,
            endDate: dates.end
        });
        setAdded(true);

        // Ждем немного анимацию, потом вызываем onSuccess (закрытие окна)
        setTimeout(() => {
            setAdded(false);
            if (onSuccess) onSuccess();
        }, 1000);
    };

    return (
        <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Quantité</label>
                <div className="flex items-center gap-2">
                    <select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="p-1 rounded border text-sm bg-white outline-none"
                    >
                        {Array.from({ length: availableQty }).map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                    </select>
                    <span className="text-[10px] text-slate-400">/ {availableQty}</span>
                </div>
            </div>

            <button
                onClick={handleAdd}
                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    added
                        ? "bg-green-600 text-white"
                        : "bg-[var(--text-primary)] text-white hover:opacity-90"
                }`}
            >
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added ? "Ajouté !" : "Ajouter"}
            </button>
        </div>
    );
}