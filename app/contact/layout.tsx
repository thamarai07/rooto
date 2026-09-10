import type { Metadata } from "next"

// The Contact page itself is a client component (scroll animations), so its
// metadata lives here in a server layout wrapper.
export const metadata: Metadata = {
  title: "Contact Rooto",
  description:
    "Get in touch with Rooto for fresh fruit orders, delivery questions or feedback. Call +91 96770 28737, email talk@rooto.in, or message us on Instagram @rooto_in.",
  alternates: { canonical: "https://rooto.in/contact" },
  openGraph: {
    title: "Contact Rooto",
    description:
      "Get in touch with Rooto for fresh fruit orders, delivery questions or feedback.",
    url: "https://rooto.in/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
