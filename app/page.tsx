'use client';

import { Camera, Mic, Video, Box, ChevronRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Page d'accueil publique (Landing Page).
 * * Cette page sert de vitrine pour l'application. Elle est accessible à tous (non connectés).
 * Elle présente le matériel, le processus de réservation et incite à l'inscription.
 * * Fonctionnalités techniques :
 * - Header réactif qui change de style au défilement (Scroll Event).
 * - Menu mobile responsive (Burger menu).
 * - Utilisation intensive de Tailwind pour le styling.
 */
export default function LandingPage() {
    // --- GESTION D'ÉTAT (State) ---

    // Gère l'ouverture/fermeture du menu sur mobile
    const [menuOpen, setMenuOpen] = useState(false);

    // Suit la position verticale du scroll pour l'effet de transparence du header
    const [scrollY, setScrollY] = useState(0);

    // --- EFFETS (Effects) ---

    // Ajoute un écouteur d'événement sur le scroll au chargement du composant
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);

        // Abonnement à l'événement
        window.addEventListener('scroll', handleScroll);

        // Nettoyage (Cleanup) : important pour éviter les fuites de mémoire
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden">

            {/* =========================================================================
                1. NAVIGATION (HEADER)
                Barre fixe qui devient semi-transparente (glassmorphism) après le scroll.
               ========================================================================= */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200' : 'bg-transparent'}`}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between h-20">

                        {/* LOGO & MARQUE */}
                        <a href="/catalogue" className="flex items-center gap-3 group">
                            <div className="relative">
                                {/* Petit point animé pour signifier "En ligne/Actif" */}
                                <div className="w-2 h-2 bg-indigo-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                                <Camera className="w-7 h-7 text-slate-800" strokeWidth={1.5} />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-light tracking-wide text-slate-900">MMI DIJON</div>
                                <div className="text-xs text-slate-500 -mt-1">Réservations</div>
                            </div>
                        </a>

                        {/* MENU BUREAU (Desktop) */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#materiel" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Matériel</a>
                            <a href="#process" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Process</a>
                            <a href="/auth/login" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Connexion</a>
                            <a href="/auth/signup" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 hover:shadow-md transition-all">
                                Commencer
                            </a>
                        </div>

                        {/* BOUTON MENU MOBILE */}
                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-900">
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* MENU DÉROULANT MOBILE */}
                {menuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-b border-slate-200 animate-in slide-in-from-top-5">
                        <div className="px-6 py-6 space-y-4">
                            <a href="#materiel" className="block text-slate-600 hover:text-indigo-600 transition-colors">Matériel</a>
                            <a href="#process" className="block text-slate-600 hover:text-indigo-600 transition-colors">Process</a>
                            <a href="/auth/login" className="block text-slate-600 hover:text-indigo-600 transition-colors">Connexion</a>
                            <a href="/auth/signup" className="block px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium text-center hover:bg-indigo-700 hover:shadow-md transition-all">
                                Commencer
                            </a>
                        </div>
                    </div>
                )}
            </nav>

            {/* =========================================================================
                2. SECTION HERO
                Présentation principale avec titre accrocheur et boutons d'action (CTA).
               ========================================================================= */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Colonne Gauche : Texte */}
                        <div className="space-y-8">

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
                                Réservez<br />
                                votre matériel<br />
                                <span className="text-slate-400">audiovisuel</span>
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed max-w-md font-light">
                                Système de réservation pour le département MMI de l'IUT Dijon. Accédez à tout l'équipement nécessaire pour vos projets.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <a href="/auth/signup" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg transition-all">
                                    Créer un compte
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a href="/auth/login" className="inline-flex items-center justify-center px-7 py-4 border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all">
                                    Se connecter
                                </a>
                            </div>

                            {/* Statistiques rapides */}
                            <div className="flex items-center gap-12 pt-8 border-t border-slate-200">
                                <div>
                                    <div className="text-3xl font-light text-slate-900">50+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Équipements</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-light text-slate-900">24/7</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Accès</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-light text-slate-900">200+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Étudiants</div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite - Grille de cartes visuelles avec animations 3D */}
                        <div className="relative hidden lg:block">
                            <div className="relative aspect-square">
                                {/* Background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 to-purple-100/40 rounded-3xl blur-3xl"></div>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                                    <div className="relative">
                                        {/* Halo central */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 backdrop-blur-3xl rounded-full blur-3xl scale-150"></div>

                                        {/* Grille de cartes équipement */}
                                        <div className="relative space-y-6">
                                            {/* Première ligne */}
                                            <div className="flex items-center gap-6 justify-end">
                                                {/* Carte Caméra */}
                                                <div className="group w-24 h-24 border-2 border-slate-200 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-3 hover:rotate-6 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <Camera className="w-10 h-10 text-slate-600 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 relative z-10" strokeWidth={1.5} />
                                                </div>

                                                {/* Carte Vidéo */}
                                                <div className="group w-32 h-32 border-2 border-slate-200 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-3 hover:rotate-6 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <Video className="w-14 h-14 text-slate-600 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 relative z-10" strokeWidth={1.5} />
                                                </div>
                                            </div>

                                            {/* Deuxième ligne */}
                                            <div className="flex items-center gap-6">
                                                {/* Carte Micro */}
                                                <div className="group w-32 h-32 border-2 border-slate-200 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-3 hover:rotate-6 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <Mic className="w-14 h-14 text-slate-600 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 relative z-10" strokeWidth={1.5} />
                                                </div>

                                                {/* Carte Accessoires */}
                                                <div className="group w-24 h-24 border-2 border-slate-200 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-3 hover:rotate-6 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <Box className="w-10 h-10 text-slate-600 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 relative z-10" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                3. SECTION CATALOGUE (Aperçu)
                Grille présentant les catégories de matériel.
               ========================================================================= */}
            <section id="materiel" className="py-20 lg:py-32 px-6 border-t border-slate-200">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16">
                        <h2 className="text-4xl lg:text-5xl font-light mb-4 text-slate-900">Catalogue</h2>
                        <p className="text-slate-600 text-lg font-light max-w-2xl">
                            Du matériel professionnel pour tous vos projets multimédia
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
                        {/* Carte Caméras */}
                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Camera className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Caméras</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                Sony, Canon, Panasonic. Full HD et 4K pour tous types de projets.
                            </p>
                        </div>

                        {/* Carte Micros */}
                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Mic className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Micros</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                HF, perches, cravates. Qualité audio professionnelle garantie.
                            </p>
                        </div>

                        {/* Carte Lumières */}
                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Video className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Éclairages</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                LED, panneaux, projecteurs. Créez l'ambiance parfaite.
                            </p>
                        </div>

                        {/* Carte Accessoires */}
                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Box className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Accessoires</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                Trépieds, stabilisateurs, cartes SD et tout le nécessaire.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                4. SECTION PROCESSUS
                Explication étape par étape du fonctionnement.
               ========================================================================= */}
            <section id="process" className="py-20 lg:py-32 px-6 border-t border-slate-200">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Titre Collant (Sticky) */}
                        <div className="lg:sticky lg:top-32">
                            <h2 className="text-4xl lg:text-5xl font-light mb-6 text-slate-900">
                                Simple et<br />efficace
                            </h2>
                            <p className="text-slate-600 text-lg font-light leading-relaxed max-w-md">
                                Un système pensé pour vous faire gagner du temps. Réservez en quelques clics et concentrez-vous sur vos projets.
                            </p>
                        </div>

                        {/* Liste des étapes */}
                        <div className="space-y-12">
                            <div className="border-l border-slate-300 pl-8 hover:border-indigo-400 transition-colors">
                                <div className="text-slate-400 text-sm mb-3">01</div>
                                <h3 className="text-2xl font-light mb-3 text-slate-900">Inscription</h3>
                                <p className="text-slate-600 font-light leading-relaxed">
                                    Créez votre compte avec votre email étudiant. Validation instantanée pour les étudiants MMI.
                                </p>
                            </div>

                            <div className="border-l border-slate-300 pl-8 hover:border-indigo-400 transition-colors">
                                <div className="text-slate-400 text-sm mb-3">02</div>
                                <h3 className="text-2xl font-light mb-3 text-slate-900">Consultation</h3>
                                <p className="text-slate-600 font-light leading-relaxed">
                                    Parcourez le catalogue complet. Vérifiez les disponibilités en temps réel et les caractéristiques techniques.
                                </p>
                            </div>

                            <div className="border-l border-slate-300 pl-8 hover:border-indigo-400 transition-colors">
                                <div className="text-slate-400 text-sm mb-3">03</div>
                                <h3 className="text-2xl font-light mb-3 text-slate-900">Réservation</h3>
                                <p className="text-slate-600 font-light leading-relaxed">
                                    Sélectionnez vos dates et confirmez. Recevez une notification de validation instantanée.
                                </p>
                            </div>

                            <div className="border-l border-slate-300 pl-8 hover:border-indigo-400 transition-colors">
                                <div className="text-slate-400 text-sm mb-3">04</div>
                                <h3 className="text-2xl font-light mb-3 text-slate-900">Récupération</h3>
                                <p className="text-slate-600 font-light leading-relaxed">
                                    Venez chercher votre matériel au département. Retour simple et suivi automatique.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                5. CALL TO ACTION
                Dernière incitation à l'inscription avant le pied de page.
               ========================================================================= */}
            <section className="py-20 lg:py-32 px-6 border-t border-slate-200">
                <div className="max-w-[1400px] mx-auto">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl lg:text-6xl font-light mb-6 leading-tight text-slate-900">
                            Prêt à réserver<br />votre équipement ?
                        </h2>
                        <p className="text-slate-600 text-lg font-light mb-10 leading-relaxed max-w-xl">
                            Rejoignez les étudiants MMI qui utilisent la plateforme au quotidien
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="/auth/signup" className="inline-flex items-center justify-center gap-2 px-8 py-5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg transition-all group">
                                Créer mon compte
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a href="/auth/login" className="inline-flex items-center justify-center px-8 py-5 border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all">
                                J'ai déjà un compte
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                6. FOOTER
                Liens utiles, contacts et crédits.
               ========================================================================= */}
            <footer className="border-t border-slate-200 px-6 py-16">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div>
                            <div className="text-sm font-light mb-4 text-slate-900">MMI DIJON</div>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                                Département Métiers du Multimédia et de l'Internet
                            </p>
                        </div>

                        <div>
                            <div className="text-sm font-light mb-4 text-slate-900">Contact</div>
                            <div className="text-xs text-slate-500 space-y-1 font-light">
                                <p>Boulevard Docteur Petitjean</p>
                                <p>21000 Dijon</p>
                                <p className="pt-2">mmi-sec@iut-dijon.u-bourgogne.fr</p>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-light mb-4 text-slate-900">Liens</div>
                            <div className="space-y-2 text-xs text-slate-500 font-light">
                                <a href="https://iutdijon.u-bourgogne.fr" className="block hover:text-indigo-600 transition-colors">IUT Dijon</a>
                                <a href="#" className="block hover:text-indigo-600 transition-colors">Département MMI</a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200">
                        <p className="text-xs text-slate-500 font-light">
                            © 2026 IUT Dijon · Département MMI · Plateforme de réservation
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
