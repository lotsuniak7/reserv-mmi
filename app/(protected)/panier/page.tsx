"use client";

import { useCart } from "@/lib/cart-context";
import { submitCartReservation } from "@/app/actions";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        setLoading(true);

        // Подготовка данных для сервера
        const payload = cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate
        }));

        const res = await submitCartReservation(payload, message);
        setLoading(false);

        if (res?.error) {
            alert("Erreur: " + res.error);
        } else {
            clearCart();
            router.push("/mes-reservations");
        }
    }

    if (cart.length === 0) {
        return <div className="p-10 text-center">Votre panier est vide.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <h1 className="text-3xl font-bold">Mon Panier ({cart.length})</h1>

            <div className="space-y-4">
                {cart.map((item) => (
                    <div key={item.id + item.startDate} className="card p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded border overflow-hidden">
                            {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">{item.name}</h3>
                            <div className="text-sm text-slate-500">
                                Du {new Date(item.startDate).toLocaleDateString()} au {new Date(item.endDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="font-mono bg-slate-100 px-3 py-1 rounded">
                            x{item.quantity}
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="card p-6 space-y-4 bg-slate-50">
                <label className="block font-bold text-sm">Message global (Projet, motif...)</label>
                <textarea
                    className="w-full border rounded p-3"
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Validation..." : "Confirmer la réservation"}
                </button>
            </div>
        </div>
    );
}