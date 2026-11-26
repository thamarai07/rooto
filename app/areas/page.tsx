import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, MessageCircle } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { SITE_URL } from '@/lib/config'
import { AREAS, DELIVERY_INFO } from '@/lib/areas'
import { whatsappLink } from '@/lib/catalog'

const AREAS_TITLE = 'Online Fruit Delivery in South Chennai – Areas We Serve'
const AREAS_DESCRIPTION =
  'Rooto delivers fresh fruits to homes in Tambaram, Medavakkam, Pallikaranai, Selaiyur, Sembakkam, Velachery, Chromepet and more of South Chennai. Find your area and order online or on WhatsApp.'

export const metadata: Metadata = {
  title: AREAS_TITLE,
  description: AREAS_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/areas` },
  openGraph: {
    title: `${AREAS_TITLE} | Rooto`,
    description: AREAS_DESCRIPTION,
    url: `${SITE_URL}/areas`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image.png`, width: 1200, height: 630, alt: 'Rooto fruit delivery areas in South Chennai' }],
  },
}

export default function AreasIndexPage() {
  const primary = AREAS.filter((a) => a.tier === 'primary')
  const nearby = AREAS.filter((a) => a.tier === 'nearby')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Delivery Areas', href: '/areas' }]} />
        </div>

        <section className="max-w-5xl mx-auto px-4 pt-4 pb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Online fruit delivery across South Chennai
          </h1>
          <p className="mt-3 max-w-3xl text-gray-600 leading-relaxed">
            Looking for a fruit shop that delivers to your home? Rooto is an online fruit shop for
            South Chennai: order fresh, hand-picked fruits on the website or on WhatsApp and we bring
            them to your door. Delivery is free on orders above ₹{DELIVERY_INFO.freeAbove}
            (otherwise a flat ₹{DELIVERY_INFO.feeBelow}), and cash on delivery is available. Pick your
            neighbourhood below to see what you can order there today.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Order fresh fruits <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink("Hi Rooto! Do you deliver fresh fruits to my area? My address: ")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-green-300 px-5 py-2.5 font-semibold text-green-700 transition hover:border-green-400"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-bold text-gray-900">Main delivery areas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {primary.map((a) => (
              <Link
                key={a.slug}
                href={`/areas/${a.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-4 transition hover:border-green-300 hover:shadow-md"
              >
                <p className="flex items-center gap-2 font-bold text-gray-900">
                  <MapPin className="h-4 w-4 text-green-600" /> {a.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">{a.blurb}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-green-700">
                  Fruit delivery in {a.name} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {nearby.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-12">
            <h2 className="text-lg font-bold text-gray-900">Nearby areas we also deliver to</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearby.map((a) => (
                <Link
                  key={a.slug}
                  href={`/areas/${a.slug}`}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-green-300 hover:text-green-700"
                >
                  Fruit delivery in {a.name}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Don&apos;t see your area? Message us on WhatsApp with your address — we&apos;ll tell you
              honestly whether we can deliver there.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
