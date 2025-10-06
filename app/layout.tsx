import "./globals.css";
import type { Metadata } from "next";
import Slidebar from "@/components/Slidebar";
import Header from "@/components/Header";

export const metadata: Metadata = { title: "MMI Dijon — Réservation" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="fr" suppressHydrationWarning>
      <body>
      <div className="min-h-screen flex">
        <Slidebar />
        <main className="flex-1 p-6">
          <Header />
          {children}
        </main>
      </div>
      </body>
      </html>
  );
}