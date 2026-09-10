import type { Metadata } from "next"

// The About page itself is a client component (scroll animations), so its
// metadata lives here in a server layout wrapper.
export const metadata: Metadata = {
  title: "About Rooto",
  description:
    "Rooto is a South-Chennai fruit-delivery startup bringing fresh, hand-picked fruits from the market to homes in Medavakkam, Pallikaranai, Tambaram and nearby areas — fast, honest and reliably fresh.",
  alternates: { canonical: "https://rooto.in/about" },
  openGraph: {
    title: "About Rooto",
    description:
      "A South-Chennai fruit-delivery startup bringing fresh, hand-picked fruits from the market to your home.",
    url: "https://rooto.in/about",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
