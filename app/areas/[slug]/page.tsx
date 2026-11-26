import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageCircle, BadgeIndianRupee, Wallet, MapPin, ArrowRight, ShoppingBag } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PromoStrip from "@/components/PromoStrip"
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/config'
import { AREA_SLUGS, DELIVERY_INFO, areasBySlugs, getArea, type Area, type AreaFaq } from '@/lib/areas'
import {
  type CatalogProduct,
  getCatalog,
  joinNatural,
  lowestPrice,
  sampleList,
  priceLabel,
  productImage,
  shortName,
  whatsappLink,
  formatRupees,
} from '@/lib/catalog'

// Product list + prices on these pages come from the live API; refresh hourly.
export const revalidate = 3600

export function generateStaticParams() {
  return AREA_SLUGS.map((slug) => ({ slug }))
}

const PHONE_DISPLAY = '+91 96770 28737'

/** "apple, guava, papaya" from the in-stock range (live). */
function fruitList(products: CatalogProduct[], max = 4): string[] {
  return products.filter((p) => p.in_stock).slice(0, max).map((p) => shortName(p.name).toLowerCase())
}

/**
 * FAQs = the hand-written, area-specific questions from lib/areas.ts plus a
 * few practical ones answered from live data (current fruits + prices) and
 * the shop's real delivery policy. Nothing here promises a delivery time.
 */
function buildFaqs(area: Area, products: CatalogProduct[]): AreaFaq[] {
  const inStock = products.filter((p) => p.in_stock)
  const faqs: AreaFaq[] = [...area.faqs]

  faqs.push({
    q: `What is the delivery charge for fruit orders in ${area.name}?`,
    a: `Delivery in ${area.name} is free on orders above ₹${DELIVERY_INFO.freeAbove}. Orders of ₹${DELIVERY_INFO.freeAbove} or less have a flat ₹${DELIVERY_INFO.feeBelow} delivery charge. The final amount, including any taxes, is shown before you confirm the order.`,
  })

  if (inStock.length > 0) {
    const list = inStock.slice(0, 6).map((p) => `${shortName(p.name).toLowerCase()} (${priceLabel(p)})`)
    faqs.push({
      q: `Which fruits can I order in ${area.name} right now?`,
      a: `Currently available: ${joinNatural(list)}. Prices follow the market, so check the shop for today's rate before you order.`,
    })
  }

  faqs.push({
    q: `Can I order fruits on WhatsApp in ${area.name}?`,
    a: `Yes. Send us a WhatsApp message on ${PHONE_DISPLAY} with the fruits you want and your address in ${area.name}${area.pincodes.length ? ` (${area.pincodes.join(' / ')})` : ''}, and we will confirm your order. You can also order directly on rooto.in.`,
  })

  return faqs
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const area = getArea(slug)
  if (!area) return { title: 'Area not found', robots: { index: false, follow: true } }

  const products = await getCatalog(3600)
  const fruits = fruitList(products, 3)
  const min = lowestPrice(products)
  const canonical = `${SITE_URL}/areas/${slug}`

  // Keep titles within ~65 chars: long area names drop the suffix.
  const title =
    area.name.length > 15
      ? `Fresh Fruit Delivery in ${area.name}`
      : `Fresh Fruit Delivery in ${area.name} – Order Fruits Online`
  const description = fruits.length
    ? `Order fresh fruits online in ${area.name} — ${sampleList(fruits)}${min ? ` from ${min}` : ''}. ₹${DELIVERY_INFO.feeBelow} delivery, free above ₹${DELIVERY_INFO.freeAbove}. Cash on delivery or order on WhatsApp.`
    : `Order fresh fruits online in ${area.name} with home delivery from Rooto. ₹${DELIVERY_INFO.feeBelow} delivery, free above ₹${DELIVERY_INFO.freeAbove}. Cash on delivery or order on WhatsApp.`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Rooto`,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: `${SITE_URL}/opengraph-image.png`, width: 1200, height: 630, alt: `Fresh fruit delivery in ${area.name} — Rooto` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Rooto`,
      description,
      images: [`${SITE_URL}/opengraph-image.png`],
    },
  }
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const area = getArea(slug)
  if (!area) notFound()

  const products = (await getCatalog(3600)).slice(0, 12)
  const inStockCount = products.filter((p) => p.in_stock).length
  const fruits = fruitList(products)
  const min = lowestPrice(products)
  const sellsByPiece = products.some((p) => p.piece_price)
  const nearby = areasBySlugs(area.nearby)
  const faqs = buildFaqs(area, products)
  const canonical = `${SITE_URL}/areas/${slug}`
  const waOrder = whatsappLink(
    `Hi Rooto! I'd like to order fresh fruits for delivery in ${area.name}. My address: `,
  )

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Delivery Areas', href: '/areas' },
    { name: area.name, href: `/areas/${slug}` },
  ]

  // Service (not LocalBusiness) — Rooto has no storefront in each area, it
  // delivers there. Only facts that are visible on the page are included.
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Fresh fruit delivery in ${area.name}`,
    serviceType: 'Fresh fruit home delivery',
    provider: { '@id': `${SITE_URL}/#business` },
    areaServed: {
      '@type': 'Place',
      name: `${area.name}, Chennai`,
      ...(area.pincodes.length
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: area.name,
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
              postalCode: area.pincodes[0],
            },
          }
        : {}),
    },
    url: canonical,
    availableChannel: [
      { '@type': 'ServiceChannel', serviceUrl: `${SITE_URL}/products`, name: 'Order online' },
      { '@type': 'ServiceChannel', servicePhone: { '@type': 'ContactPoint', telephone: '+91-96770-28737', contactType: 'orders' }, name: 'WhatsApp / phone' },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <JsonLd data={[serviceSchema, faqSchema]} />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <Breadcrumbs items={crumbs} />
        </div>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-4 pb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Fresh Fruit Delivery in {area.name}
          </h1>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">{area.blurb}</p>
          {area.intro && (
            <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">{area.intro}</p>
          )}
          {fruits.length > 0 && (
            <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">
              Right now you can order {joinNatural(fruits)}
              {inStockCount > fruits.length ? ' and more' : ''}
              {min ? <> — prices start at <strong className="text-gray-900">{min}</strong></> : null}.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Order fresh fruits <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waOrder}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-green-300 px-5 py-2.5 font-semibold text-green-700 transition hover:border-green-400"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          </div>
        </section>

        {/* Delivery info — only verified, policy-level facts */}
        <section className="max-w-5xl mx-auto px-4 pb-8" aria-label={`Delivery details for ${area.name}`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BadgeIndianRupee, label: 'Delivery charge', value: `Free above ₹${DELIVERY_INFO.freeAbove} · otherwise ₹${DELIVERY_INFO.feeBelow}` },
              { icon: Wallet, label: 'Payment', value: 'Cash on delivery or pay online' },
              { icon: ShoppingBag, label: 'Buy by', value: sellsByPiece ? 'Weight (kg) or by the piece' : 'Weight (kg)' },
              { icon: MapPin, label: area.pincodes.length > 1 ? 'Pincodes' : 'Pincode', value: area.pincodes.join(', ') || 'Chennai' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                <Icon className="h-5 w-5 text-green-600" aria-hidden="true" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live products + prices */}
        {products.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">
                Fresh fruit prices in {area.name} today
              </h2>
              <Link href="/products" className="shrink-0 text-sm font-semibold text-green-700 hover:underline">
                View all fruits
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${encodeURIComponent(p.slug)}`}
                  className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage(p.image)}
                    alt={`Fresh ${shortName(p.name).toLowerCase()} — ${p.name}`}
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-2.5">
                    <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                    {p.final_price > 0 && (
                      <p className="mt-0.5 text-sm text-green-700">
                        ₹{formatRupees(p.final_price)}
                        <span className="text-xs text-gray-400">/{p.unit || 'kg'}</span>
                        {p.piece_price && (
                          <span className="text-xs text-gray-500"> · ₹{formatRupees(p.piece_price)}/pc</span>
                        )}
                      </p>
                    )}
                    {!p.in_stock && <p className="mt-0.5 text-xs font-medium text-gray-400">Out of stock</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* How to order */}
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-bold text-gray-900">How to order fruits online in {area.name}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">On the website</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-600">
                <li>
                  Pick your fruits on the <Link href="/products" className="font-medium text-green-700 hover:underline">fresh fruits page</Link>{sellsByPiece ? ' — by weight or by the piece' : ''}.
                </li>
                <li>At checkout, add your delivery address in {area.name}.</li>
                <li>Pay cash on delivery or online, and confirm the order.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">On WhatsApp</h3>
              <p className="mt-2 text-sm text-gray-600">
                Prefer chatting? Message us on{' '}
                <a href={waOrder} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                  WhatsApp ({PHONE_DISPLAY})
                </a>{' '}
                with the fruits and quantity you want and your address in {area.name}. We&apos;ll reply to confirm
                your order.
              </p>
            </div>
          </div>
        </section>

        {/* Localities covered */}
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-bold text-gray-900">Areas we cover in {area.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {area.localities.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-sm text-green-800"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {loc}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Not sure if we reach your street? Ask us on{' '}
            <a href={waOrder} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">WhatsApp</a>{' '}
            before you order, or check at checkout.
          </p>
        </section>

        {/* FAQs */}
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-bold text-gray-900">
            Fruit delivery in {area.name} — common questions
          </h2>
          <div className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="cursor-pointer list-none font-medium text-gray-900">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Nearby areas */}
        {nearby.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-12">
            <h2 className="text-lg font-bold text-gray-900">Nearby areas we deliver to</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearby.map((n) => (
                <Link
                  key={n.slug}
                  href={`/areas/${n.slug}`}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-green-300 hover:text-green-700"
                >
                  Fruit delivery in {n.name}
                </Link>
              ))}
              <Link
                href="/areas"
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 transition hover:border-green-300"
              >
                All South Chennai areas →
              </Link>
            </div>
          </section>
        )}
        <PromoStrip placement="areas" className="pb-10" />
      </main>

      <Footer />
    </div>
  )
}
