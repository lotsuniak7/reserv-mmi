import { Mail, MapPin, Clock, FileText, Youtube, AlertCircle } from "lucide-react";

export default function AidePage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Заголовок */}
            <div className="space-y-2 border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Aide & Tutoriels
                </h1>
                <p className="text-[var(--text-secondary)] text-lg">
                    Réponses aux questions fréquentes et guides d'utilisation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ЛЕВАЯ КОЛОНКА: FAQ (Занимает 2/3 ширины) */}
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="text-2xl">❓</span> Questions Fréquentes
                        </h2>

                        <div className="space-y-3">
                            <FaqItem
                                question="Combien de temps puis-je emprunter du matériel ?"
                                answer="La durée standard d'un emprunt est de 2 à 3 jours. Pour les projets de fin d'année ou besoins spécifiques, veuillez contacter l'administration directement pour une dérogation."
                            />
                            <FaqItem
                                question="Que faire si le matériel est cassé ou en panne ?"
                                answer="Ne tentez pas de le réparer vous-même ! Signalez le problème immédiatement lors du retour (ou par mail si cela arrive pendant le tournage). Toute casse non signalée pourra entraîner une suspension des droits d'emprunt."
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

                    {/* Секция Туториалов */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 mt-8">
                            <span className="text-2xl">🎓</span> Tutoriels Rapides
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TutorialCard
                                title="Prise en main Canon 850D"
                                description="Les réglages de base pour la vidéo."
                                link="https://www.youtube.com/watch?v=EXAMPLE"
                            />
                            <TutorialCard
                                title="Enregistrer avec le Zoom H5"
                                description="Bien régler les gains et choisir les micros."
                                link="#"
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

                {/* ПРАВАЯ КОЛОНКА: Инфо и Контакты (Занимает 1/3) */}
                <div className="space-y-6">
                    {/* Карточка Контактов */}
                    <div className="card p-6 bg-slate-50 border-slate-200">
                        <h3 className="font-semibold text-lg mb-4 text-[var(--text-primary)]">Nous contacter</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-[var(--primary)] mt-0.5" size={18} />
                                <div>
                                    <span className="font-medium block">Le Magasin (Salle 204)</span>
                                    <span className="text-[var(--text-secondary)]">IUT Dijon-Auxerre, Aile MMI</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="text-[var(--primary)] mt-0.5" size={18} />
                                <div>
                                    <span className="font-medium block">Horaires d'ouverture</span>
                                    <span className="text-[var(--text-secondary)] block">Lun - Ven : 09h45 - 10h15</span>
                                    <span className="text-[var(--text-secondary)] block">Lun - Jeu : 16h30 - 17h00</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="text-[var(--primary)] mt-0.5" size={18} />
                                <div>
                                    <span className="font-medium block">E-mail</span>
                                    <a href="mailto:magasin-mmi@u-bourgogne.fr" className="text-[var(--primary)] hover:underline">
                                        magasin-mmi@u-bourgogne.fr
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Блок "Важно" */}
                    <div className="card p-5 bg-amber-50 border-amber-200 text-amber-800">
                        <div className="flex gap-3">
                            <AlertCircle className="shrink-0" size={20} />
                            <div className="text-sm">
                                <p className="font-semibold mb-1">Rappel important</p>
                                <p>N'oubliez pas de charger les batteries et de vider les cartes SD avant de rendre le matériel !</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Маленький компонент для FAQ (аккордеон)
function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <details className="group bg-white rounded-lg border border-[var(--border)] overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-[var(--text-primary)] hover:bg-slate-50 transition select-none">
                {question}
                <span className="transform group-open:rotate-180 transition-transform text-[var(--text-secondary)]">
                    ▼
                </span>
            </summary>
            <div className="p-4 pt-0 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-transparent group-open:border-[var(--border)] group-open:pt-4">
                {answer}
            </div>
        </details>
    );
}

// Карточка туториала
function TutorialCard({ title, description, link, type = "video" }: { title: string, description: string, link: string, type?: "video" | "pdf" }) {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block card p-4 hover:shadow-md transition border hover:border-[var(--primary)] group">
            <div className="flex items-start justify-between mb-2">
                {type === "video" ? (
                    <Youtube className="text-red-500 group-hover:scale-110 transition-transform" size={24} />
                ) : (
                    <FileText className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                )}
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {type === "video" ? "Vidéo" : "PDF"}
                </span>
            </div>
            <h4 className="font-semibold text-sm mb-1 group-hover:text-[var(--primary)]">{title}</h4>
            <p className="text-xs text-[var(--text-secondary)]">{description}</p>
        </a>
    );
}