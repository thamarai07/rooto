import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Truck, BadgeIndianRupee, Wallet, MapPin, ArrowRight } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import { API_BASE, IMAGE_BASE, SITE_URL } from '@/lib/config'
import { AREA_SLUGS, DELIVERY_INFO, areasBySlugs, getArea } from '@/lib/areas'

export const revalidate = 3600

export function generateStaticParams() {
  return AREA_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const area = getArea(slug)
  if (!area) return { title: 'Area not found', robots: { index: false, follow: true } }

  const canonical = `${SITE_URL}/areas/${slug}`
  const description = `${area.blurb} Order online for fast home delivery — free above ₹${DELIVERY_INFO.freeAbove}, cash on delivery available, open 24 hours.`

  return {
    title: `Fresh Fruit Delivery in ${area.name}`,
    description: description.length > 300 ? `${description.slice(0, 297)}…` : description,
    alternates: { canonical },
    openGraph: {
      title: `Fresh Fruit Delivery in ${area.name} | Rooto`,
      description: area.blurb,
      url: canonical,
      images: [`${SITE_URL}/opengraph-image.png`],
    },
  }
}

type ListProduct = {
  id: number
  name: string
  slug?: string
  image?: string
  price_per_kg?: number
  price?: number
  unit?: string
  discount_percent?: number
}

async function getPopularProducts(): Promise<ListProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/get-product.php?limit=8`, {
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.status === 'success' ? (data.items ?? []) : []
  } catch {
    return []
  }
}

function imgUrl(image?: string): string {
  const file = String(image || '').split(',')[0].trim()
  if (!file) return `${SITE_URL}/placeholder.jpg`
  if (/^https?:\/\//i.test(file)) return file
  return `${IMAGE_BASE}/${file}`
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const area = getArea(slug)
  if (!area) notFound()

  const products = await getPopularProducts()
  const nearby = areasBySlugs(area.nearby)
  const canonical = `${SITE_URL}/areas/${slug}`

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Delivery Areas', href: '/areas' },
    { name: area.name, href: `/areas/${slug}` },
  ]

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Fresh fruit home delivery',
    provider: { '@id': `${SITE_URL}/#business` },
    areaServed: {
      '@type': 'City',
      name: `${area.name}, Chennai`,
    },
    url: canonical,
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  }

  const faqSchema =
    area.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: area.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <JsonLd data={faqSchema ? [serviceSchema, faqSchema] : [serviceSchema]} />

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
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Order fresh fruits <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/areas"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-green-300 px-5 py-2.5 font-semibold text-green-700 transition hover:border-green-400"
            >
              All delivery areas
            </Link>
          </div>
        </section>

        {/* Delivery info */}
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, label: 'Delivery time', value: DELIVERY_INFO.speed },
              { icon: Truck, label: 'Service hours', value: DELIVERY_INFO.hours },
              { icon: BadgeIndianRupee, label: 'Free delivery', value: `On orders above ₹${DELIVERY_INFO.freeAbove} (₹${DELIVERY_INFO.feeBelow} below)` },
              { icon: Wallet, label: 'Payment', value: 'Cash on delivery or pay online' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                <Icon className="h-5 w-5 text-green-600" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
              </div>
            ))}
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
                <MapPin className="h-3.5 w-3.5" /> {loc}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Not sure if we reach your street? Enter your pincode at checkout to confirm serviceability
            {area.pincodes.length > 0 && ` (${area.pincodes.join(', ')})`}.
          </p>
        </section>

        {/* Popular products */}
        {products.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-8">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Popular fruits to order in {area.name}
              </h2>
              <Link href="/products" className="text-sm font-semibold text-green-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const price = Number(p.price_per_kg ?? p.price) || 0
                return (
                  <Link
                    key={p.id}
                    href={p.slug ? `/product/${p.slug}` : `/product/${p.id}`}
                    className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl(p.image)}
                      alt={p.name}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-2.5">
                      <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                      {price > 0 && (
                        <p className="mt-0.5 text-sm text-green-700">
                          ₹{price}
                          <span className="text-xs text-gray-400">/{p.unit || 'kg'}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* FAQs */}
        {area.faqs.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-8">
            <h2 className="text-lg font-bold text-gray-900">
              Fruit delivery in {area.name} — common questions
            </h2>
            <div className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
              {area.faqs.map((f) => (
                <details key={f.q} className="group p-4">
                  <summary className="cursor-pointer list-none font-medium text-gray-900">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

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
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
