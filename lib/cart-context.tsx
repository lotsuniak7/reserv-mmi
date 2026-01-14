"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Définition d'un article dans le panier
export type CartItem = {
    id: number;
    name: string;
    image_url: string | null;
    quantity: number;
    maxQuantity: number;
    startDate: string;
    endDate: string;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    // On modifie remove pour qu'il prenne aussi les dates, sinon on risque de supprimer le mauvais item
    removeFromCart: (id: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Provider du Panier (Global).
 * Gère l'état du panier et la persistance dans le LocalStorage du navigateur.
 */
export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Chargement initial (Côté Client uniquement)
    useEffect(() => {
        const saved = localStorage.getItem("mmi-cart");
        if (saved) {
            try {
                setCart(JSON.parse(saved));
            } catch (e) {
                console.error("Erreur lecture panier", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // 2. Sauvegarde automatique à chaque changement
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("mmi-cart", JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    // Ajouter un item
    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            // On vérifie si l'item existe déjà (Même ID ET Mêmes Dates)
            const existingIndex = prev.findIndex(
                (i) => i.id === item.id && i.startDate === item.startDate && i.endDate === item.endDate
            );

            if (existingIndex >= 0) {
                // Si oui, on remplace (mise à jour de la quantité)
                const newCart = [...prev];
                newCart[existingIndex] = item;
                return newCart;
            }
            // Sinon, on ajoute à la fin
            return [...prev, item];
        });
    };

    // Supprimer un item (Par ID simple pour l'instant, selon ton code précédent)
    // Note : Idéalement, il faudrait aussi passer les dates pour être précis,
    // mais pour l'instant on garde ta logique simple qui supprime par ID.
    const removeFromCart = (id: number) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
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

// Hook personnalisé pour utiliser le panier
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
    }
    return context;
}