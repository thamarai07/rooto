import type { Metadata } from "next"
import { API_BASE, SITE_URL } from "@/lib/config"

// The festival page itself is a client component, so its metadata lives in
// this server layout. Before this existed, festival pages inherited the
// homepage canonical — telling Google they were duplicates of "/".
export async function generateMetadata({
  params,
}: {
  params: Promise<{ special: string }>
}): Promise<Metadata> {
  const { special } = await params
  const slug = decodeURIComponent(special || "")

  let festival: { name?: string; tagline?: string | null; description?: string | null; banner_image?: string | null } | null = null
  try {
    const res = await fetch(`${API_BASE}/get_festival.php?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      if (data.status === "success" && data.festival) festival = data.festival
    }
  } catch {
    festival = null
  }

  // Unknown / inactive festival: keep it out of the index.
  if (!festival?.name) {
    return { title: "Festival offers", robots: { index: false, follow: true } }
  }

  const canonical = `${SITE_URL}/festival/${encodeURIComponent(slug)}`
  const title = `${festival.name} Fruit Specials – Order Online`
  const extra = String(festival.description || festival.tagline || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const description = `${extra ? `${extra}. ` : ""}Order fresh fruits for ${festival.name} from Rooto with home delivery across South Chennai.`
  const image = festival.banner_image || `${SITE_URL}/opengraph-image.png`

  return {
    title,
    description: description.length > 200 ? `${description.slice(0, 197)}…` : description,
    alternates: { canonical },
    openGraph: { title: `${title} | Rooto`, description, url: canonical, images: [image] },
  }
}

export default function FestivalLayout({ children }: { children: React.ReactNode }) {
  return children
}
