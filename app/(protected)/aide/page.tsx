import { Mail, MapPin, Clock, FileText, AlertCircle, PlayCircle } from "lucide-react";

export default function AidePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-10 p-4">
            {/* En-tête */}
            <div className="space-y-2 border-b border-[var(--border)] pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Aide & Tutoriels
                </h1>
                <p className="text-[var(--text-secondary)] text-lg">
                    Réponses aux questions fréquentes et guides d'utilisation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* --- COLONNE GAUCHE (Large) --- */}
                <div className="lg:col-span-2 space-y-10">

                    {/* SECTION 1: FAQ */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                            <span className="text-red-500 font-bold text-2xl">?</span> Questions Fréquentes
                        </h2>

                        <div className="space-y-3">
                            <FaqItem
                                question="Combien de temps puis-je emprunter du matériel ?"
                                answer="La durée standard d'un emprunt est de 2 à 3 jours. Pour les projets de fin d'année ou besoins spécifiques, veuillez contacter l'administration directement pour une dérogation."
                            />
                            <FaqItem
                                question="Que faire si le matériel est cassé ou en panne ?"
                                answer="Ne tentez pas de le réparer vous-même ! Signalez le problème immédiatement lors du retour. Toute casse non signalée pourra entraîner une suspension des droits d'emprunt."
                            />
                            <FaqItem
                                question="Comment annuler ma réservation ?"
                                answer="Vous pouvez annuler une réservation tant qu'elle est en statut 'En attente' directement depuis la page 'Mes réservations'. Si elle est déjà validée, contactez les techniciens."
                            />
                            <FaqItem
                                question="Puis-je prêter le matériel à un ami ?"
                                answer="Non. La réservation est nominative. Vous êtes personnellement responsable du matériel emprunté avec votre compte."
                            />
                        </div>
                    </section>

                    {/* SECTION 2: TUTORIELS (En Grille comme tu aimes) */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                            <span className="text-2xl">🎓</span> Tutoriels Rapides
                        </h2>

                        {/* C'est ici que l'on force la GRILLE (grid-cols-2) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <TutorialCard
                                title="Prise en main Canon 850D"
                                description="Les réglages de base pour la vidéo."
                                link="#"
                                type="video"
                            />
                            <TutorialCard
                                title="Enregistrer avec le Zoom H5"
                                description="Bien régler les gains et choisir les micros."
                                link="#"
                                type="video"
                            />
                            <TutorialCard
                                title="Éclairage 3 points"
                                description="Guide PDF sur l'installation d'un plateau."
                                type="pdf"
                                link="#"
                            />
                        </div>
                    </section>
                </div>

                {/* --- COLONNE DROITE (Contacts) --- */}
                <div className="space-y-6">
                    {/* Carte Contact */}
                    <div className="card p-6 bg-white border border-[var(--border)] shadow-sm h-fit">
                        <h3 className="font-bold text-lg mb-6 text-[var(--text-primary)]">Nous contacter</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <MapPin className="text-[var(--primary)]" size={18} />
                                </div>
                                <div>
                                    <span className="font-semibold block text-sm text-[var(--text-primary)]">Le Magasin (Salle 204)</span>
                                    <span className="text-sm text-[var(--text-secondary)]">IUT Dijon-Auxerre, Aile MMI</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Clock className="text-[var(--primary)]" size={18} />
                                </div>
                                <div>
                                    <span className="font-semibold block text-sm text-[var(--text-primary)]">Horaires d'ouverture</span>
                                    <div className="text-sm text-[var(--text-secondary)] space-y-1 mt-1">
                                        <p>Lun - Ven : <span className="font-medium text-[var(--text-primary)]">09h45 - 10h15</span></p>
                                        <p>Lun - Jeu : <span className="font-medium text-[var(--text-primary)]">16h30 - 17h00</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Mail className="text-[var(--primary)]" size={18} />
                                </div>
                                <div>
                                    <span className="font-semibold block text-sm text-[var(--text-primary)]">E-mail</span>
                                    <a href="mailto:magasin-mmi@u-bourgogne.fr" className="text-sm text-[var(--primary)] hover:underline break-all">
                                        magasin-mmi@u-bourgogne.fr
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Carte Important */}
                    <div className="card p-5 bg-orange-50 border border-orange-100 text-orange-900 shadow-sm">
                        <div className="flex gap-3">
                            <AlertCircle className="shrink-0 text-orange-600" size={20} />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Rappel important</p>
                                <p className="leading-relaxed opacity-90">
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

// Composant FAQ (Accordéon propre)
function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <details className="group bg-white rounded-lg border border-[var(--border)] overflow-hidden shadow-sm transition-all duration-200 open:shadow-md">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-[var(--text-primary)] hover:bg-slate-50 transition select-none">
                {question}
                <span className="transform group-open:rotate-180 transition-transform duration-200 text-slate-400">
                    ▼
                </span>
            </summary>
            <div className="px-4 pb-4 pt-0 text-sm text-[var(--text-secondary)] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="h-px w-full bg-slate-100 mb-3"></div>
                {answer}
            </div>
        </details>
    );
}

// Composant Carte Tutoriel (Style PDF/Vidéo comme sur ton image)
function TutorialCard({ title, description, link, type = "video" }: { title: string, description: string, link: string, type?: "video" | "pdf" }) {
    const isVideo = type === "video";

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl border border-[var(--border)] p-5 hover:shadow-md hover:border-[var(--primary)] transition-all group h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-3">
                {/* Icône change selon le type */}
                {isVideo ? (
                    <PlayCircle className="text-red-500 group-hover:scale-110 transition-transform duration-300" size={28} strokeWidth={1.5} />
                ) : (
                    <FileText className="text-blue-500 group-hover:scale-110 transition-transform duration-300" size={28} strokeWidth={1.5} />
                )}

                {/* Badge Type */}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    isVideo ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                }`}>
                    {isVideo ? "Vidéo" : "PDF"}
                </span>
            </div>

            <h4 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                {title}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {description}
            </p>
        </a>
    );
}