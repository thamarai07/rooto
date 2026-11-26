import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, MessageCircle, BadgeIndianRupee, ShoppingBag } from "lucide-react";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import Footer from "@/components/footer";
import PromoStrip from "@/components/PromoStrip";
import FruitPriceList from "@/components/seo/FruitPriceList";
import { AREAS, DELIVERY_INFO } from "@/lib/areas";
import { SITE_URL } from "@/lib/config";
import { getCatalog, getRawProducts, lowestPrice, sampleList, shortName, whatsappLink } from "@/lib/catalog";

const HOME_TITLE = "Online Fruit Shop & Fruit Home Delivery in South Chennai | Rooto";

// Homepage targets the brand + "fruit delivery near me / fruits home delivery"
// intent. "/products" owns "buy fruits online / fruit prices", and each
// /areas/* page owns its own locality, so the three don't compete.
export async function generateMetadata(): Promise<Metadata> {
  const products = await getCatalog();
  const fruits = products.filter((p) => p.in_stock).slice(0, 3).map((p) => shortName(p.name).toLowerCase());
  const description = `Online fruit shop for South Chennai. Order fresh fruits${
    fruits.length ? ` — ${sampleList(fruits)} —` : ""
  } for home delivery in Tambaram, Medavakkam & nearby. Free delivery above ₹${DELIVERY_INFO.freeAbove}.`;

  return {
    title: { absolute: HOME_TITLE },
    description,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: HOME_TITLE,
      description,
      url: SITE_URL,
      siteName: "Rooto",
      locale: "en_IN",
      type: "website",
      images: [{ url: `${SITE_URL}/opengraph-image.png`, width: 1200, height: 630, alt: "Rooto — fresh fruit home delivery in South Chennai" }],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description,
      images: [`${SITE_URL}/opengraph-image.png`],
    },
  };
}

const HOME_FAQS = [
  {
    q: "Where can I buy fresh fruits nearby in South Chennai?",
    a: (
      <>
        If you live in one of our <Link href="/areas" className="text-green-700 hover:underline">delivery areas</Link> —
        Tambaram, Medavakkam, Pallikaranai, Selaiyur, Sembakkam, Velachery, Chromepet and nearby — you don&apos;t need
        to visit a fruit shop. Order on rooto.in or on WhatsApp and the fruits come to your door.
      </>
    ),
  },
  {
    q: "Which fruit shop delivers to my home?",
    a: (
      <>
        Rooto is an online fruit shop that delivers fresh fruits to homes across South Chennai. Open your{" "}
        <Link href="/areas" className="text-green-700 hover:underline">area page</Link> to see what you can order there
        today, or ask us on WhatsApp if you&apos;re not sure we cover your street.
      </>
    ),
  },
  {
    q: "How much does fruit delivery cost?",
    a: (
      <>
        Delivery is free on orders above ₹{DELIVERY_INFO.freeAbove}. Otherwise, a flat ₹{DELIVERY_INFO.feeBelow}{" "}
        delivery charge applies. You can pay cash on delivery or online. See{" "}
        <Link href="/shipping" className="text-green-700 hover:underline">delivery information</Link>.
      </>
    ),
  },
  {
    q: "Can I buy just a few pieces instead of a full kilo?",
    a: (
      <>
        Yes. Most fruits can be ordered by weight or by the piece, so it&apos;s easy to buy fresh fruits for daily
        consumption without over-buying. Check each fruit on the{" "}
        <Link href="/products" className="text-green-700 hover:underline">fresh fruits page</Link>.
      </>
    ),
  },
];

export default async function Home() {
  // One API call per request: the product cards (first 12, same order as the
  // old ?limit=12 call) and the SEO price table share the same response.
  const [raw, catalog] = await Promise.all([getRawProducts(), getCatalog()]);
  const initialProducts = raw.slice(0, 12);
  const min = lowestPrice(catalog);
  const waOrder = whatsappLink("Hi Rooto! I'd like to order fresh fruits. My address: ");
  const primaryAreas = AREAS.filter((a) => a.tier === "primary");
  const nearbyAreas = AREAS.filter((a) => a.tier === "nearby");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Primary page heading — the single H1 for the homepage. Visually
            hidden to keep the existing banner-first design. */}
        <h1 className="sr-only">
          Rooto — online fruit shop with fresh fruit home delivery in Tambaram, Medavakkam,
          Pallikaranai and across South Chennai
        </h1>
        <PromoStrip placement="home_top" className="mt-6" />
        <ProductGrid initialProducts={initialProducts} />
        <PromoStrip placement="home_bottom" />

        {/* Ordering + delivery facts + today's prices (all live / policy data) */}
        <section className="max-w-7xl mx-auto px-4 pt-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Fresh fruits online, delivered to your home
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 leading-relaxed">
            Skip the trip to the fruit shop. Choose your fruits on Rooto, pay cash on delivery or online,
            and we deliver to your door in South Chennai
            {min ? <> — with prices starting at <strong className="text-gray-900">{min}</strong></> : null}.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <BadgeIndianRupee className="h-5 w-5 text-green-600" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Clear delivery charges</h3>
              <p className="mt-1 text-sm text-gray-600">
                Free delivery above ₹{DELIVERY_INFO.freeAbove}; flat ₹{DELIVERY_INFO.feeBelow} below. Cash on delivery available.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <ShoppingBag className="h-5 w-5 text-green-600" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Order fruits for home</h3>
              <p className="mt-1 text-sm text-gray-600">
                Buy by weight or by the piece — a few fruits for today or a week&apos;s supply.{" "}
                <Link href="/products" className="font-medium text-green-700 hover:underline">See all fruits</Link>
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <MessageCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Order on WhatsApp</h3>
              <p className="mt-1 text-sm text-gray-600">
                Send your fruit list and address to{" "}
                <a href={waOrder} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                  +91 96770 28737
                </a>{" "}
                and we&apos;ll confirm your order.
              </p>
            </div>
          </div>

          {catalog.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">Today&apos;s fresh fruit prices</h2>
              <div className="mt-3">
                <FruitPriceList products={catalog.slice(0, 12)} caption="Today's fresh fruit prices at Rooto" />
              </div>
            </div>
          )}
        </section>

        {/* Local delivery areas — internal links to the /areas/* landing pages */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Fruit delivery across South Chennai
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Rooto delivers fresh, hand-picked fruits to Tambaram, Medavakkam, Pallikaranai, Selaiyur,
            Velachery and nearby neighbourhoods. Pick your area to see prices and delivery details.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[...primaryAreas, ...nearbyAreas].map((a) => (
              <Link
                key={a.slug}
                href={`/areas/${a.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-green-300 hover:text-green-700"
              >
                <MapPin className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
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

        {/* Common questions (visible content; no FAQ schema on the homepage) */}
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Common questions</h2>
          <div className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {HOME_FAQS.map((f) => (
              <details key={f.q} className="p-4">
                <summary className="cursor-pointer list-none font-medium text-gray-900">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

