// app/products/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import ProductsPageLayout from "@/components/ProductsPageLayout"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import PromoStrip from "@/components/PromoStrip"
import JsonLd from "@/components/seo/JsonLd"
import FruitPriceList from "@/components/seo/FruitPriceList"
import { SITE_URL } from "@/lib/config"
import { DELIVERY_INFO } from "@/lib/areas"
import { getCatalog, getRawProducts, lowestPrice, sampleList, shortName, whatsappLink } from "@/lib/catalog"

const PRODUCTS_TITLE = "Buy Fresh Fruits Online – Today's Fruit Prices"

// /products owns the "buy fruits online / order fresh fruits online / fruit
// prices" intent. Description is built from the live catalogue so the fruits
// and starting price it mentions are always true.
export async function generateMetadata(): Promise<Metadata> {
  const products = await getCatalog()
  const fruits = products.filter((p) => p.in_stock).slice(0, 4).map((p) => shortName(p.name).toLowerCase())
  const min = lowestPrice(products)
  const description = `Order fresh fruits online from Rooto${
    fruits.length ? ` — ${sampleList(fruits)}` : ""
  }${min ? `, from ${min}` : ""}. Buy by weight or by the piece, with home delivery across South Chennai. Free delivery above ₹${DELIVERY_INFO.freeAbove}.`

  return {
    title: PRODUCTS_TITLE,
    description,
    alternates: { canonical: `${SITE_URL}/products` },
    openGraph: {
      title: `${PRODUCTS_TITLE} | Rooto`,
      description,
      url: `${SITE_URL}/products`,
      type: "website",
      images: [{ url: `${SITE_URL}/opengraph-image.png`, width: 1200, height: 630, alt: "Fresh fruits from Rooto" }],
    },
  }
}

export default async function ProductsPage() {
  // Server-render the product cards so the product links are in the HTML
  // (they used to be fetched client-side only). One API call per request.
  const [raw, catalog] = await Promise.all([getRawProducts(), getCatalog()])
  const initialProducts = raw.slice(0, 12)

  // ItemList of product URLs — no prices/ratings here; each Product page
  // carries its own Product + Offer schema from live data.
  const itemListSchema = catalog.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Fresh fruits at Rooto",
        itemListElement: catalog.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/product/${encodeURIComponent(p.slug)}`,
          name: p.name,
        })),
      }
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {itemListSchema && <JsonLd data={itemListSchema} />}
      <ProductsPageLayout>
        <h1 className="sr-only">Buy fresh fruits online — Rooto</h1>
        <PromoStrip placement="products" contained={false} />
        <ProductGrid initialProducts={initialProducts} />

        {catalog.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900">Fresh fruit prices today</h2>
            <p className="mt-1 text-sm text-gray-600">
              Prices follow the market and are updated in the shop. Order by weight or by the piece.
            </p>
            <div className="mt-3">
              <FruitPriceList products={catalog} caption="Fresh fruit prices today at Rooto" />
            </div>
          </section>
        )}

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Delivery charges</h2>
            <p className="mt-2 text-sm text-gray-600">
              Free home delivery on orders above ₹{DELIVERY_INFO.freeAbove}; a flat ₹{DELIVERY_INFO.feeBelow} delivery
              charge otherwise. Pay cash on delivery or online. Any applicable tax is shown at checkout.{" "}
              <Link href="/shipping" className="font-medium text-green-700 hover:underline">Delivery details</Link>
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Where we deliver</h2>
            <p className="mt-2 text-sm text-gray-600">
              We deliver fresh fruits to homes in{" "}
              <Link href="/areas/tambaram" className="text-green-700 hover:underline">Tambaram</Link>,{" "}
              <Link href="/areas/medavakkam" className="text-green-700 hover:underline">Medavakkam</Link>,{" "}
              <Link href="/areas/pallikaranai" className="text-green-700 hover:underline">Pallikaranai</Link>,{" "}
              <Link href="/areas/selaiyur" className="text-green-700 hover:underline">Selaiyur</Link>,{" "}
              <Link href="/areas/velachery" className="text-green-700 hover:underline">Velachery</Link> and{" "}
              <Link href="/areas" className="font-medium text-green-700 hover:underline">more South Chennai areas</Link>.
              Prefer chatting?{" "}
              <a
                href={whatsappLink("Hi Rooto! I'd like to order fresh fruits. My address: ")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-700 hover:underline"
              >
                Order on WhatsApp
              </a>
              .
            </p>
          </div>
        </section>
      </ProductsPageLayout>
      <Footer />
    </div>
  )
}
