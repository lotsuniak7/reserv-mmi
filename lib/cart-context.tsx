"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Structure d'un article dans le panier
export type CartItem = {
    id: number;
    name: string;
    image_url: string | null;
    quantity: number;
    maxQuantity: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
};

// Type de retour pour la fonction d'ajout
type AddToCartResult = { success: boolean; error?: string };

type CartContextType = {
    cart: CartItem[];
    addToCart: (item: CartItem) => AddToCartResult; // <--- Retourne désormais un résultat
    removeFromCart: (id: number, startDate?: string, endDate?: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Chargement initial
    useEffect(() => {
        const saved = localStorage.getItem("mmi-cart");
        if (saved) {
            try { setCart(JSON.parse(saved)); }
            catch (e) { console.error("Erreur lecture panier", e); }
        }
        setIsInitialized(true);
    }, []);

    // 2. Sauvegarde automatique
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("mmi-cart", JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    /**
     * Ajoute un item au panier avec vérification stricte des dates.
     * Empêche d'avoir plusieurs périodes de réservation différentes dans le même panier.
     */
    const addToCart = (item: CartItem): AddToCartResult => {
        // RÈGLE D'OR : Si le panier contient déjà des articles,
        // le nouvel article DOIT avoir exactement les mêmes dates et heures.
        if (cart.length > 0) {
            const refItem = cart[0]; // On prend le premier article comme référence

            const isSameStart = item.startDate === refItem.startDate;
            const isSameEnd = item.endDate === refItem.endDate;
            const isSameStartTime = item.startTime === refItem.startTime;
            const isSameEndTime = item.endTime === refItem.endTime;

            if (!isSameStart || !isSameEnd || !isSameStartTime || !isSameEndTime) {
                // ÉCHEC : Les dates ne correspondent pas
                return {
                    success: false,
                    error: "Conflit de dates : Vous ne pouvez pas mélanger plusieurs périodes de réservation dans le même panier. Veuillez vider le panier ou choisir les mêmes dates."
                };
            }
        }

        // SUCCÈS : Les dates correspondent (ou le panier est vide), on procède à l'ajout
        setCart((prev) => {
            const existingIndex = prev.findIndex(
                (i) => i.id === item.id &&
                    i.startDate === item.startDate &&
                    i.endDate === item.endDate
            );

            if (existingIndex >= 0) {
                // Mise à jour de la quantité si l'item existe déjà
                const newCart = [...prev];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: item.quantity,
                    // On met à jour les heures au cas où (bien que théoriquement identiques ici)
                    startTime: item.startTime,
                    endTime: item.endTime
                };
                return newCart;
            }
            // Ajout d'une nouvelle ligne
            return [...prev, item];
        });

        return { success: true };
    };

    const removeFromCart = (id: number, startDate?: string, endDate?: string) => {
        setCart((prev) => prev.filter((i) => {
            if (startDate && endDate) {
                const isSameItem = i.id === id && i.startDate === startDate && i.endDate === endDate;
                return !isSameItem;
            }
            return i.id !== id;
        }));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("mmi-cart");
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
    }
    return context;
}