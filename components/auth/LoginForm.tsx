"use client";

export default function LoginForm({action, error,}: { action: (fd: FormData) => void; error?: string }) {
    return (
        <form action={action} className="card p-6 space-y-4 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">Connexion</h1>

            {error && (
                <div className="p-3 rounded-md text-sm" style={{ background:"#fee2e2", color:"#991b1b" }}>
                    {error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-sm">Adresse e-mail</label>
                <input name="email" type="email" required className="border rounded-md px-3 py-2 w-full" placeholder="prenom.nom@exemple.fr" />
            </div>

            <div className="space-y-1">
                <label className="text-sm">Mot de passe</label>
                <input name="password" type="password" required className="border rounded-md px-3 py-2 w-full" />
            </div>

            <button type="submit" className="px-4 py-2 rounded-lg text-white" style={{ background:"var(--primary)" }}>
                Se connecter
            </button>
        </form>
    );
}