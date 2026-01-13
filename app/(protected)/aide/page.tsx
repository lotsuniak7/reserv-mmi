import { Mail, MapPin, Clock, FileText, AlertCircle, PlayCircle, ChevronDown } from "lucide-react";

/**
 * Données statiques pour la FAQ.
 * Facilite la maintenance et l'ajout de nouvelles questions.
 */
const FAQS = [
    {
        question: "Combien de temps puis-je emprunter du matériel ?",
        answer: "La durée standard d'un emprunt est de 2 à 3 jours. Pour les projets de fin d'année ou besoins spécifiques, veuillez contacter l'administration directement pour une dérogation."
    },
    {
        question: "Que faire si le matériel est cassé ou en panne ?",
        answer: "Ne tentez pas de le réparer vous-même ! Signalez le problème immédiatement lors du retour. Toute casse non signalée pourra entraîner une suspension des droits d'emprunt."
    },
    {
        question: "Comment annuler ma réservation ?",
        answer: "Vous pouvez annuler une réservation tant qu'elle est en statut 'En attente' directement depuis la page 'Mes réservations'. Si elle est déjà validée, contactez les techniciens."
    },
    {
        question: "Puis-je prêter le matériel à un ami ?",
        answer: "Non. La réservation est nominative. Vous êtes personnellement responsable du matériel emprunté avec votre compte."
    }
];

/**
 * Données statiques pour les Tutoriels.
 */
const TUTORIALS = [
    {
        title: "Prise en main Canon 850D",
        description: "Les réglages de base pour la vidéo (ISO, Ouverture, Vitesse).",
        link: "#",
        type: "video" as const
    },
    {
        title: "Enregistrer avec le Zoom H5",
        description: "Bien régler les gains et choisir les capsules micro.",
        link: "#",
        type: "video" as const
    },
    {
        title: "Éclairage 3 points",
        description: "Guide PDF sur l'installation d'un plateau interview.",
        link: "#",
        type: "pdf" as const
    }
];

/**
 * Page d'Aide et Support (/aide).
 * Centralise les ressources pour les étudiants : FAQ, Tutoriels et Contact.
 * Cette page est statique (Server Component) pour une performance optimale.
 */
export default function AidePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-10 p-4 md:p-8">

            {/* 1. En-tête de la page */}
            <div className="space-y-2 border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Aide & Tutoriels
                </h1>
                <p className="text-slate-500 text-lg">
                    Réponses aux questions fréquentes et guides d'utilisation du matériel.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* --- COLONNE GAUCHE (Contenu Principal) --- */}
                <div className="lg:col-span-2 space-y-12">

                    {/* SECTION FAQ */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-lg">?</span>
                            Questions Fréquentes
                        </h2>

                        <div className="space-y-3">
                            {FAQS.map((faq, index) => (
                                <FaqItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </section>

                    {/* SECTION TUTORIELS */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                            <span className="text-2xl">🎓</span> Tutoriels Rapides
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {TUTORIALS.map((tuto, index) => (
                                <TutorialCard
                                    key={index}
                                    title={tuto.title}
                                    description={tuto.description}
                                    link={tuto.link}
                                    type={tuto.type}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* --- COLONNE DROITE (Sidebar Infos) --- */}
                <div className="space-y-6">

                    {/* Carte Contact */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
                        <h3 className="font-bold text-lg mb-6 text-slate-900 border-b pb-2">Nous contacter</h3>

                        <div className="space-y-6">
                            {/* Localisation */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <MapPin className="text-indigo-600" size={18} />
                                </div>
                                <div>
                                    <span className="font-semibold block text-sm text-slate-900">Le Magasin (Salle 204)</span>
                                    <span className="text-sm text-slate-500">IUT Dijon-Auxerre, Aile MMI</span>
                                </div>
                            </div>

                            {/* Horaires */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Clock className="text-indigo-600" size={18} />
                                </div>
                                <div>
                                    <span className="font-semibold block text-sm text-slate-900">Horaires d'ouverture</span>
                                    <div className="text-sm text-slate-500 space-y-1 mt-1">
                                        <p>Lun - Ven : <span className="font-medium text-slate-700">09h45 - 10h15</span></p>
                                        <p>Lun - Jeu : <span className="font-medium text-slate-700">16h30 - 17h00</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Mail className="text-indigo-600" size={18} />
                                </div>
                                <div>
                                    <span className="font-semibold block text-sm text-slate-900">E-mail</span>
                                    <a href="mailto:magasin-mmi@u-bourgogne.fr" className="text-sm text-indigo-600 hover:underline break-all">
                                        magasin-mmi@u-bourgogne.fr
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Carte Rappel Important */}
                    <div className="p-5 bg-orange-50 border border-orange-100 rounded-xl text-orange-900 shadow-sm">
                        <div className="flex gap-3">
                            <AlertCircle className="shrink-0 text-orange-600" size={20} />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Rappel important</p>
                                <p className="leading-relaxed opacity-90 text-xs">
                                    N'oubliez pas de charger les batteries et de vider les cartes SD avant de rendre le matériel !
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------
   COMPOSANTS UI INTERNES
   Petits composants spécifiques à cette page pour alléger le rendu principal.
   ------------------------------------------------------------------------- */

/**
 * Composant FAQ (Accordéon).
 * Utilise la balise HTML native <details> pour une accessibilité sans JS.
 */
function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <details className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm transition-all duration-200 open:shadow-md open:ring-1 open:ring-indigo-100">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-slate-700 hover:bg-slate-50 transition select-none list-none">
                {question}
                <ChevronDown className="w-4 h-4 text-slate-400 transform group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <div className="px-4 pb-4 pt-0 text-sm text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="h-px w-full bg-slate-100 mb-3"></div>
                {answer}
            </div>
        </details>
    );
}

/**
 * Composant Carte Tutoriel.
 * Affiche soit une icône Vidéo, soit PDF selon le type.
 */
function TutorialCard({ title, description, link, type = "video" }: { title: string, description: string, link: string, type?: "video" | "pdf" }) {
    const isVideo = type === "video";

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all group h-full flex flex-col relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-3">
                {isVideo ? (
                    <PlayCircle className="text-red-500 group-hover:scale-110 transition-transform duration-300" size={28} strokeWidth={1.5} />
                ) : (
                    <FileText className="text-blue-500 group-hover:scale-110 transition-transform duration-300" size={28} strokeWidth={1.5} />
                )}

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    isVideo ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                }`}>
                    {isVideo ? "Vidéo" : "PDF"}
                </span>
            </div>

            <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
                {description}
            </p>
        </a>
    );
}