"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getPromoStrips, type PromoPlacement, type PromoStripItem } from "@/lib/api/promoStrips.api"

interface PromoStripProps {
  placement: PromoPlacement
  /** Set false when the parent already provides the max-w-7xl/px-4 container. */
  contained?: boolean
  className?: string
}

/**
 * Wide promotional image strip(s), uploaded and managed from the admin portal.
 * Renders nothing when no live strip is assigned to this placement.
 */
export default function PromoStrip({ placement, contained = true, className = "" }: PromoStripProps) {
  const [strips, setStrips] = useState<PromoStripItem[]>([])

  useEffect(() => {
    let active = true
    getPromoStrips().then((all) => {
      if (active) setStrips(all.filter((s) => s.placements.includes(placement)))
    })
    return () => {
      active = false
    }
  }, [placement])

  if (strips.length === 0) return null

  return (
    <section
      aria-label="Offers"
      className={`${contained ? "max-w-7xl mx-auto px-4" : ""} flex flex-col gap-4 ${className}`}
    >
      {strips.map((strip) => (
        <StripLink key={strip.id} strip={strip}>
          <picture>
            {strip.mobile_image && <source media="(max-width: 767px)" srcSet={strip.mobile_image} />}
            <img
              src={strip.desktop_image}
              alt={strip.title}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </picture>
        </StripLink>
      ))}
    </section>
  )
}

function StripLink({ strip, children }: { strip: PromoStripItem; children: React.ReactNode }) {
  const className =
    "block overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"

  if (!strip.link_url) return <div className={className}>{children}</div>

  if (strip.link_url.startsWith("/") && !strip.open_new_tab) {
    return (
      <Link href={strip.link_url} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={strip.link_url}
      className={className}
      {...(strip.open_new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}
