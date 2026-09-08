"use client"

import type { Festival } from "@/lib/festivals.api"

export default function FestivalHero({ festival }: { festival: Festival }) {
  const theme = festival.theme_color || "#0f9d58"

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-5">
        {festival.banner_image ? (
          <div className="rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
            <picture>
              {festival.mobile_image && (
                <source media="(max-width: 767px)" srcSet={festival.mobile_image} />
              )}
              <img
                src={festival.banner_image}
                alt={festival.name}
                className="w-full h-auto object-cover max-h-[300px]"
              />
            </picture>
          </div>
        ) : (
          <div
            className="rounded-xl px-4 py-7 sm:py-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
            style={{
              background: `linear-gradient(135deg, ${theme}, ${theme}cc)`,
            }}
          >
            <p className="text-white/80 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase">
              Festival Store
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-4xl font-black text-white drop-shadow">
              {festival.name}
            </h1>
            {festival.tagline && (
              <p className="mt-2 text-white/90 text-xs sm:text-base font-medium max-w-2xl mx-auto">
                {festival.tagline}
              </p>
            )}
          </div>
        )}

        {festival.banner_image && (festival.tagline || festival.name) && (
          <div className="mt-3 flex items-center gap-2.5">
            <span
              className="inline-block w-1.5 h-6 rounded-full"
              style={{ background: theme }}
            />
            <div>
              <h1 className="text-base sm:text-xl font-black text-gray-900 leading-tight">
                {festival.name}
              </h1>
              {festival.tagline && (
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  {festival.tagline}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
