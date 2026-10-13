import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import Header from "@/components/header";
import Banner from "@/components/banner";
import ProductGrid from "@/components/product-grid";
import Footer from "@/components/footer";
import PromoStrip from "@/components/PromoStrip";
import { AREAS } from "@/lib/areas";

export const metadata: Metadata = {
  title: "Rooto — Fresh Fruit Delivery in South Chennai",
  description:
    "Buy fresh, hand-picked fruits online from Rooto and get same-day or next-day home delivery in Medavakkam, Pallikaranai, Tambaram, Velachery, Chromepet and nearby South Chennai areas.",
  alternates: { canonical: "https://rooto.in" },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

// Fetch the home cards on the SERVER so they're already in the HTML.
// Cached for 5 min (matches `revalidate`), so most visitors hit a warm cache
// instead of waiting on a cold connection to Hostinger after hydration.
async function getInitialProducts() {
  try {
    const res = await fetch(`${API_BASE}/get-product.php?limit=12`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.status === "success" ? data.items : [];
  } catch {
    return []; // fall back to client fetch inside ProductGrid
  }
}

export default async function Home() {
  const initialProducts = await getInitialProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky wrapper for both header + search bar */}
      <div className="sticky top-0 z-[50]">
        <Header />
        <Banner />
      </div>
      <main className="flex-1">
        {/* Primary page heading — the single H1 for the homepage. Visually
            minimal on purpose. */}
        <h1 className="sr-only">
          Rooto — fresh fruit delivery in Medavakkam, Pallikaranai, Tambaram and
          across South Chennai
        </h1>
        <PromoStrip placement="home_top" className="mt-6" />
        <ProductGrid initialProducts={initialProducts} />
        <PromoStrip placement="home_bottom" />

        {/* Local delivery areas — internal links to the /areas/* landing pages */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Fresh fruit delivery across South Chennai
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Rooto delivers hand-picked fruits to Medavakkam, Pallikaranai, Tambaram, Velachery
            and nearby neighbourhoods — most orders in about an hour, open 24 hours.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {AREAS.filter((a) => a.tier === "primary").map((a) => (
              <Link
                key={a.slug}
                href={`/areas/${a.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-green-300 hover:text-green-700"
              >
                <MapPin className="h-3.5 w-3.5 text-green-600" />
                {a.name}
              </Link>
            ))}
            <Link
              href="/areas"
              className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              All delivery areas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export const revalidate = 300;
