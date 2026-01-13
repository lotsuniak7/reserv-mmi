/**
 * Layout spécifique aux pages d'authentification.
 * Centre le contenu verticalement et horizontalement sur un fond gris clair.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                {children}
            </div>
        </div>
    );
}