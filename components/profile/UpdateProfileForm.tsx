"use client";

import { useState } from "react";
import { updateUserProfile } from "@/app/actions";
import { Save, Loader2, Phone, GraduationCap, BookOpen } from "lucide-react";

export default function UpdateProfileForm({ profile }: { profile: any }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await updateUserProfile(formData);
        setIsLoading(false);

        if (res?.error) {
            alert("Erreur: " + res.error);
        } else {
            alert("Profil mis à jour avec succès ! ✅");
        }
    }

    return (
        <form action={handleSubmit} className="space-y-5">

            {/* Nom complet (Lecture seule) */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nom & Prénom</label>
                <input
                    type="text"
                    value={profile?.full_name || ""}
                    disabled
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-medium"
                />
                <p className="text-[10px] text-slate-400">Pour modifier votre nom, contactez l'administration.</p>
            </div>

            {/* Téléphone */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Phone size={12}/> Téléphone
                </label>
                <input
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone || ""}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filière */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <GraduationCap size={14}/> Filière (Année)
                    </label>
                    <div className="relative">
                        <select
                            name="filiere"
                            defaultValue={profile?.filiere || "BUT 1"}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="BUT 1">BUT 1</option>
                            <option value="BUT 2">BUT 2</option>
                            <option value="BUT 3">BUT 3</option>
                            <option value="LP">Licence Pro</option>
                        </select>
                    </div>
                </div>

                {/* Parcours */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <BookOpen size={12}/> Parcours
                    </label>
                    <div className="relative">
                        <select
                            name="parcours"
                            defaultValue={profile?.parcours || "Tronc commun"}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="Tronc commun">Tronc commun</option>
                            <option value="DWDI">DWDI (Web)</option>
                            <option value="CN">CN (Numérique)</option>
                            <option value="SCNDE">SCNDE (Design)</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-70 transition ml-auto"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    );
}