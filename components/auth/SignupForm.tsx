"use client";

export default function SignupForm({ action }: { action: (fd: FormData) => void }) {
    return (
        <form action={action} className="card p-6 space-y-4 max-w-sm">
            <h1 className="text-xl font-semibold">Créer un compte</h1>

            <div className="space-y-1">
                <label className="text-sm">Nom complet</label>
                <input name="full_name" type="text" required className="border rounded-md px-3 py-2 w-full" placeholder="Jean Dupont" />
            </div>

            <div className="space-y-1">
                <label className="text-sm">Adresse e-mail</label>
                <input name="email" type="email" required className="border rounded-md px-3 py-2 w-full" placeholder="prenom.nom@exemple.fr" />
            </div>

            <div className="space-y-1">
                <label className="text-sm">Mot de passe</label>
                <input name="password" type="password" required className="border rounded-md px-3 py-2 w-full" />
            </div>

            <button type="submit" className="px-4 py-2 rounded-lg text-white" style={{ background: "var(--primary)" }}>
                S’inscrire
            </button>
        </form>
    );
}