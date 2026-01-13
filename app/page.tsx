'use client';

import { Camera, Mic, Video, Box, ChevronRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden">

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200' : 'bg-transparent'}`}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between h-20">
                        <a href="/catalogue" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                                <Camera className="w-7 h-7 text-slate-800" strokeWidth={1.5} />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-light tracking-wide text-slate-900">MMI DIJON</div>
                                <div className="text-xs text-slate-500 -mt-1">Réservations</div>
                            </div>
                        </a>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#materiel" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Matériel</a>
                            <a href="#process" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Process</a>
                            <a href="/auth/login" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Connexion</a>
                            <a href="/auth/signup" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 hover:shadow-md transition-all">
                                Commencer
                            </a>
                        </div>

                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-900">
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

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

            {/* Hero */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
                                Réservez<br />votre matériel<br /><span className="text-slate-400">audiovisuel</span>
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

                        <div className="relative hidden lg:block">
                            <div className="relative aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-transparent rounded-2xl"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-200/30 backdrop-blur-3xl rounded-full blur-3xl scale-150"></div>
                                        <div className="relative space-y-6">
                                            <div className="flex items-center gap-6 justify-end">
                                                <div className="w-24 h-24 border border-slate-200 bg-white/80 backdrop-blur flex items-center justify-center hover:border-indigo-300 hover:shadow-md transition-all">
                                                    <Camera className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
                                                </div>
                                                <div className="w-32 h-32 border border-slate-200 bg-white/80 backdrop-blur flex items-center justify-center hover:border-indigo-300 hover:shadow-md transition-all">
                                                    <Video className="w-14 h-14 text-slate-600" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="w-32 h-32 border border-slate-200 bg-white/80 backdrop-blur flex items-center justify-center hover:border-indigo-300 hover:shadow-md transition-all">
                                                    <Mic className="w-14 h-14 text-slate-600" strokeWidth={1.5} />
                                                </div>
                                                <div className="w-24 h-24 border border-slate-200 bg-white/80 backdrop-blur flex items-center justify-center hover:border-indigo-300 hover:shadow-md transition-all">
                                                    <Box className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
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

            {/* Catalogue */}
            <section id="materiel" className="py-20 px-6 border-t border-slate-200">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-12">
                        <h2 className="text-4xl font-light mb-4 text-slate-900">Catalogue</h2>
                        <p className="text-slate-600 text-lg font-light max-w-2xl">
                            Du matériel professionnel pour tous vos projets multimédia
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Camera className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Caméras</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                Sony, Canon, Panasonic. Full HD et 4K pour tous types de projets.
                            </p>
                        </div>

                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Mic className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Micros</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                HF, perches, cravates. Qualité audio professionnelle garantie.
                            </p>
                        </div>

                        <div className="bg-white p-8 hover:bg-indigo-50 transition-colors group">
                            <Video className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-6" strokeWidth={1.5} />
                            <h3 className="text-xl font-light mb-2 text-slate-900">Éclairages</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">
                                LED, panneaux, projecteurs. Créez l'ambiance parfaite.
                            </p>
                        </div>

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

        </div>
    );
}