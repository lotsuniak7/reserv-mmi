"use client";

import { useCart } from "@/lib/cart-context";
import { submitCartReservation, getMyProfile } from "@/app/actions"; // on importe getMyProfile
import { useState, useEffect } from "react";
import { Trash2, Calendar, ShoppingBag, ArrowRight, Package, User, BookOpen, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Page Panier (Client Component).
 * Cette page gère la finalisation de la réservation.
 * Elle inclut désormais le formulaire complet "Bon de Sortie".
 */
export default function CartPage() {
    // Récupération des fonctions et données du Panier (Global Context)
    const { cart, removeFromCart, clearCart } = useCart();
    const router = useRouter();

    // États locaux pour le formulaire "Bon de Sortie"
    const [loading, setLoading] = useState(false);

    // Données Étudiant
    const [fullName, setFullName] = useState(""); // Juste pour affichage
    const [phone, setPhone] = useState("");

    // Données Scolaires
    const [filiere, setFiliere] = useState("BUT 1");
    const [parcours, setParcours] = useState("Tronc commun");

    // Données Projet
    const [projectType, setProjectType] = useState<'pédagogique' | 'personnel'>('pédagogique');
    const [enseignant, setEnseignant] = useState("");
    const [message, setMessage] = useState("");

    // Chargement initial : On récupère les infos "mémoire" du profil
    useEffect(() => {
        async function loadProfile() {
            const profile = await getMyProfile();
            if (profile) {
                setFullName(profile.full_name || "");
                if (profile.phone) setPhone(profile.phone);
                if (profile.filiere) setFiliere(profile.filiere);
                if (profile.parcours) setParcours(profile.parcours);
            }
        }
        loadProfile();
    }, []);

    /**
     * Gère la soumission du formulaire.
     */
    async function handleSubmit() {
        if (loading) return;

        // Validation basique
        if (!phone) { alert("Merci de renseigner un numéro de téléphone."); return; }
        if (!enseignant) { alert("Merci de renseigner l'enseignant référent."); return; }

        setLoading(true);

        // 1. Préparation du payload panier
        const payload = cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate
        }));

        // 2. Préparation des infos Bon de Sortie
        const bookingDetails = {
            phone,
            filiere,
            parcours,
            projectType,
            enseignant
        };

        // 3. Appel du Server Action
        const res = await submitCartReservation(payload, message, bookingDetails);
        setLoading(false);

        // 4. Gestion de la réponse
        if (res?.error) {
            alert("Erreur lors de la réservation : " + res.error);
        } else {
            clearCart();
            router.push("/mes-reservations");
        }
    }

    // --- ÉTAT : PANIER VIDE ---
    if (cart.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-6 text-center">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Votre panier est vide</h1>
                <p className="text-slate-500 mb-8">
                    Vous n'avez pas encore sélectionné de matériel. Parcourez le catalogue pour commencer.
                </p>
                <Link
                    href="/catalogue"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                    Retour au catalogue <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    // --- ÉTAT : PANIER REMPLI ---
    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">

            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Finaliser la demande</h1>
                    <p className="text-slate-500 mt-1">Complétez le bon de sortie pour valider.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                    {cart.length} article{cart.length > 1 ? 's' : ''}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNE GAUCHE : Liste des articles */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-lg text-slate-800 mb-2">1. Matériel sélectionné</h2>

                    {cart.map((item, index) => {
                        const uniqueKey = `${item.id}-${item.startDate}-${item.endDate}-${index}`;

                        return (
                            <div key={uniqueKey} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:border-indigo-200 transition group">
                                {/* Image Miniature */}
                                <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-slate-300" size={24} />
                                    )}
                                </div>

                                {/* Infos Article */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg truncate">{item.name}</h3>

                                    <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-indigo-500" />
                                            <span>
                                                Du <span className="font-medium text-slate-700">{new Date(item.startDate).toLocaleDateString("fr-FR")}</span>
                                            </span>
                                        </div>
                                        <div className="hidden sm:block text-slate-300">•</div>
                                        <div>
                                            Au <span className="font-medium text-slate-700">{new Date(item.endDate).toLocaleDateString("fr-FR")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quantité & Suppression */}
                                <div className="flex flex-col items-end gap-3 pl-2">
                                    <div className="font-mono text-sm font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                                        x{item.quantity}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id, item.startDate, item.endDate)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                        title="Retirer du panier"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* COLONNE DROITE : Bon de Sortie */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-6">
                        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-indigo-600"/> 2. Informations Étudiant
                        </h2>

                        <div className="space-y-4">

                            {/* Identité (Lecture seule + Téléphone) */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                                <div className="text-sm">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Nom & Prénom</label>
                                    <div className="font-bold text-slate-700">{fullName || "Chargement..."}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone <span className="text-red-500">*</span></label>
                                    <div className="flex items-center bg-white border border-slate-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                                        <div className="pl-3 text-slate-400"><Phone size={14}/></div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="06 12 34 56 78"
                                            className="w-full p-2 text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Scolarité */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filière</label>
                                    <select
                                        value={filiere}
                                        onChange={(e) => setFiliere(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="BUT 1">BUT 1</option>
                                        <option value="BUT 2">BUT 2</option>
                                        <option value="BUT 3">BUT 3</option>
                                        <option value="LP">Licence Pro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parcours</label>
                                    <select
                                        value={parcours}
                                        onChange={(e) => setParcours(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="Tronc commun">Tronc commun</option>
                                        <option value="DWDI">DWDI (Web)</option>
                                        <option value="CN">CN (Numérique)</option>
                                        <option value="SCNDE">SCNDE (Design)</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-slate-100 my-2" />

                            {/* Projet */}
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-600"/> 3. Détails Projet
                            </h2>

                            {/* Type de projet (Toggle) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type de projet</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setProjectType('pédagogique')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${projectType === 'pédagogique' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Pédagogique
                                    </button>
                                    <button
                                        onClick={() => setProjectType('personnel')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${projectType === 'personnel' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Personnel
                                    </button>
                                </div>
                            </div>

                            {/* Enseignant */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Enseignant Référent <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={enseignant}
                                    onChange={(e) => setEnseignant(e.target.value)}
                                    placeholder="Nom de l'enseignant"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                />
                            </div>

                            {/* Commentaire optionnel */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Remarques <span className="text-slate-400 font-normal lowercase">(optionnel)</span>
                                </label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                                    rows={2}
                                    placeholder="Détails supplémentaires..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            {/* Bouton Validation */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        Validation en cours...
                                    </>
                                ) : (
                                    "Confirmer la demande"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}