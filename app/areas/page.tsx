import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { SITE_URL } from '@/lib/config'
import { AREAS, DELIVERY_INFO } from '@/lib/areas'

export const metadata: Metadata = {
  title: 'Fruit Delivery Areas in South Chennai',
  description:
    'Rooto delivers fresh, hand-picked fruits across Medavakkam, Pallikaranai, Tambaram, Velachery, Chromepet, Madipakkam and more. See every area we deliver to and order online.',
  alternates: { canonical: `${SITE_URL}/areas` },
  openGraph: {
    title: 'Fruit Delivery Areas in South Chennai | Rooto',
    description:
      'Every South-Chennai neighbourhood Rooto delivers fresh fruit to — order online for fast home delivery.',
    url: `${SITE_URL}/areas`,
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
            Fresh fruit delivery across South Chennai
          </h1>
          <p className="mt-3 max-w-3xl text-gray-600 leading-relaxed">
            Rooto brings fresh, hand-picked fruits to your door across South Chennai —
            {' '}{DELIVERY_INFO.speed.toLowerCase()}, {DELIVERY_INFO.hours.toLowerCase()}, with free
            delivery on orders above ₹{DELIVERY_INFO.freeAbove} and cash on delivery available.
            Pick your neighbourhood below.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            Order fresh fruits <ArrowRight className="h-4 w-4" />
          </Link>
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
                  {a.name}
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
