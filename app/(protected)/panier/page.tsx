"use client";

import { useCart } from "@/lib/cart-context";
import { submitCartReservation } from "@/app/actions";
import { useState } from "react";
import { Trash2, Calendar, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Page Panier (Client Component).
 * Cette page gère la finalisation de la réservation.
 * Elle utilise le contexte React (useCart) pour récupérer les choix stockés localement,
 * puis envoie le tout au Server Action pour l'enregistrement en base de données.
 */
export default function CartPage() {
    // Récupération des fonctions et données du Panier (Global Context)
    const { cart, removeFromCart, clearCart } = useCart();

    // États locaux pour le formulaire
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Hook de navigation pour rediriger après succès
    const router = useRouter();

    /**
     * Gère la soumission du formulaire.
     * Transforme les données du panier local en format compatible avec la base de données.
     */
    async function handleSubmit() {
        if (loading) return;
        setLoading(true);

        // 1. Préparation du payload (On garde seulement les champs nécessaires pour le serveur)
        const payload = cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate
        }));

        // 2. Appel du Server Action (Fonction asynchrone dans app/actions.ts)
        const res = await submitCartReservation(payload, message);
        setLoading(false);

        // 3. Gestion de la réponse
        if (res?.error) {
            // En cas d'erreur (ex: stock épuisé entre temps), on alerte l'utilisateur
            alert("Erreur lors de la réservation : " + res.error);
        } else {
            // Succès : On vide le panier local et on redirige
            clearCart();
            router.push("/mes-reservations");
        }
    }

    // --- ÉTAT : PANIER VIDE ---
    if (cart.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-6 text-center">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Votre panier est vide</h1>
                <p className="text-slate-500 mb-8">
                    Vous n'avez pas encore sélectionné de matériel. Parcourez le catalogue pour commencer.
                </p>
                <Link
                    href="/catalogue"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                    Retour au catalogue <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    // --- ÉTAT : PANIER REMPLI ---
    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">

            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Récapitulatif</h1>
                    <p className="text-slate-500 mt-1">Vérifiez vos dates avant de valider.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                    {cart.length} article{cart.length > 1 ? 's' : ''}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNE GAUCHE : Liste des articles */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={`${item.id}-${item.startDate}`} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:border-indigo-200 transition group">

                            {/* Image Miniature */}
                            <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="text-slate-300" size={24} />
                                )}
                            </div>

                            {/* Infos Article */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-lg truncate">{item.name}</h3>

                                <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-indigo-500" />
                                        <span>
                                            Du <span className="font-medium text-slate-700">{new Date(item.startDate).toLocaleDateString("fr-FR")}</span>
                                        </span>
                                    </div>
                                    <div className="hidden sm:block text-slate-300">•</div>
                                    <div>
                                        Au <span className="font-medium text-slate-700">{new Date(item.endDate).toLocaleDateString("fr-FR")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantité & Suppression */}
                            <div className="flex flex-col items-end gap-3 pl-2">
                                <div className="font-mono text-sm font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                                    x{item.quantity}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                    title="Retirer du panier"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* COLONNE DROITE : Validation */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                        <h2 className="font-bold text-lg text-slate-800 mb-4">Finalisation</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block font-medium text-sm text-slate-700">
                                    Note pour l'administrateur <span className="text-slate-400 font-normal">(Optionnel)</span>
                                </label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                                    rows={4}
                                    placeholder="Ex: Projet court-métrage S3, besoin de batteries supplémentaires..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        Validation...
                                    </>
                                ) : (
                                    "Confirmer la demande"
                                )}
                            </button>

                            <p className="text-xs text-center text-slate-400 leading-relaxed px-2">
                                En validant, vous vous engagez à respecter le matériel et les délais de retour du département MMI.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}