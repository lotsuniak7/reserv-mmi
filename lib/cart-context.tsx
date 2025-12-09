"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    removeFromCart: (id: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Загрузка из localStorage при запуске
    useEffect(() => {
        const saved = localStorage.getItem("mmi-cart");
        if (saved) {
            try { setCart(JSON.parse(saved)); } catch {}
        }
    }, []);

    // Сохранение при изменении
    useEffect(() => {
        localStorage.setItem("mmi-cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id && i.startDate === item.startDate && i.endDate === item.endDate);
            if (existing) {
                // Если такой же товар на те же даты уже есть -> обновляем количество
                return prev.map((i) => (i === existing ? { ...i, quantity: item.quantity } : i));
            }
            return [...prev, item];
        });
    };

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

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}