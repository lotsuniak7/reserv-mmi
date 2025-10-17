// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MMI Dijon — Réservation",
    description: "Application de réservation du matériel MMI Dijon",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body>{children}</body>
        </html>
    );
}