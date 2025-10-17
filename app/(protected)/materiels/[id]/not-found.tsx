export default function NotFound() {
    return (
        <div className="card p-6">
            <h2 className="text-lg font-semibold mb-2">Matériel introuvable</h2>
            <p className="text-sm text-[var(--text-secondary)]">
                L’élément demandé n’existe pas ou a été supprimé.
            </p>
        </div>
    );
}