import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import de la police Google
import { CartProvider } from "@/lib/cart-context";

// Configuration de la police (Inter est très propre pour les UI modernes)
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MMI Dijon — Réservation",
    description: "Plateforme de gestion et réservation de matériel audiovisuel.",
};

/**
 * Layout Racine (RootLayout).
 * Ce fichier enveloppe TOUTE l'application.
 * Il charge :
 * 1. Les styles globaux (Tailwind).
 * 2. La police d'écriture.
 * 3. Le CartProvider (pour que le panier soit accessible partout).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <CartProvider>
            {children}
        </CartProvider>
        </body>
        </html>
    );
}