"use client";
import Link from "next/link";

type Props = {
    id: number;
    name: string;
    status: string;          // 'dispo' | 'réservé' | 'indisponible' | ...
    categorie?: string | null;
    quantite?: number | null;
    image_url?: string | null;
};

const statusMap: Record<string, { text: string; classes: string }> = {
    dispo:        { text: "dispo",        classes: "bg-green-100 text-green-700" },
    disponible:   { text: "dispo",        classes: "bg-green-100 text-green-700" },
    "réservé":    { text: "réservé",      classes: "bg-amber-100 text-amber-700" },
    reserve:      { text: "réservé",      classes: "bg-amber-100 text-amber-700" },
    reserved:     { text: "réservé",      classes: "bg-amber-100 text-amber-700" },
    indisponible: { text: "indisponible", classes: "bg-red-100 text-red-700" },
    unavailable:  { text: "indisponible", classes: "bg-red-100 text-red-700" },
};

export default function MaterialCard({
                                         id, name, status, categorie, quantite, image_url,
                                     }: Props) {
    const st = statusMap[status] ?? { text: status, classes: "bg-slate-100 text-slate-700" };

    return (
        <div>
            {/* h-full, чтобы все карточки выравнивались по высоте в гриде */}
            <article className="card p-4 hover:shadow transition h-full flex flex-col">
                {/* 1) Vignette — фиксируем высоту и соотношение */}
                <div className="mb-3 rounded overflow-hidden bg-[var(--surface)]">
                    <div className="w-full aspect-video">
                        {image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image_url} alt={name} className="w-full h-full object-cover" />
                        ) : null}
                    </div>
                </div>

                {/* 2) Titre — максимум 2 строки */}
                <h3 className="font-semibold line-clamp-2 min-h-[3rem]">
                    {name}
                </h3>

                {/* Spacer: расталкивает мету вниз */}
                <div className="flex-1" />

                {/* 3) Meta-bar — всегда внизу, в одну линию */}
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex items-center gap-2">
                        {categorie ? (
                            <span
                                className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                                title={categorie}
                            >
                {categorie}
              </span>
                        ) : null}

                        {typeof quantite === "number" ? (
                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                Qté&nbsp;: {quantite}
              </span>
                        ) : null}
                    </div>

                    <span className={`px-2 py-1 rounded-full shrink-0 ${st.classes}`}>
            {st.text}
          </span>
                </div>
            </article>
        </div>
    );
}