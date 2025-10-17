"use client";

export default function LogoutButton({ action }: { action: () => void }) {
    return (
        <form action={action}>
            <button className="px-3 py-2 card hover:opacity-90">Se déconnecter</button>
        </form>
    );
}