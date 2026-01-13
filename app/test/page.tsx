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
                        <a href="/" className="flex items-center gap-3">
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
                    <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-b border-slate-200">
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
                                Système de réservation pour le département MMI de l'IUT Dijon.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="/auth/signup" className="px-7 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all">
                                    Créer un compte
                                </a>
                                <a href="/auth/login" className="px-7 py-4 border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all">
                                    Se connecter
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalogue preview */}
            <section id="materiel" className="py-20 px-6 border-t border-slate-200">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-4xl font-light mb-8">Catalogue</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6"><Camera className="w-8 h-8 mb-4" /> Caméras</div>
                        <div className="bg-white p-6"><Mic className="w-8 h-8 mb-4" /> Micros</div>
                        <div className="bg-white p-6"><Video className="w-8 h-8 mb-4" /> Éclairages</div>
                        <div className="bg-white p-6"><Box className="w-8 h-8 mb-4" /> Accessoires</div>
                    </div>
                </div>
            </section>
        </div>
    );
}