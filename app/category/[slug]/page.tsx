// app/category/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import CategoryClient from './CategoryClient'
import PromoStrip from '@/components/PromoStrip'
import { SITE_URL } from '@/lib/config'
import { CATEGORY_DB_NAME, getCatalog } from '@/lib/catalog'

export const revalidate = 300

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES: Record<string, { title: string; description: string; emoji: string }> = {
    'dairy-eggs': {
        title: 'Dairy & Eggs',
        description:
            'Order fresh milk, curd, paneer, eggs and dairy products online at Rooto. Daily delivery available.',
        emoji: '🥛',
    },
    bakery: {
        title: 'Bakery & Bread',
        description:
            'Fresh breads, cakes, buns and bakery items delivered from Rooto. Order online for same-day delivery.',
        emoji: '🍞',
    },
    beverages: {
        title: 'Beverages & Drinks',
        description:
            'Shop juices, water, soft drinks and healthy beverages online at Rooto. Fast delivery to your home.',
        emoji: '🧃',
    },
    snacks: {
        title: 'Snacks & Munchies',
        description:
            'Order chips, biscuits, namkeen and snacks online at Rooto. Quick delivery guaranteed.',
        emoji: '🍿',
    },
    household: {
        title: 'Household & Cleaning',
        description:
            'Buy household essentials, cleaning products and home care items online at Rooto.',
        emoji: '🧹',
    },
    'personal-care': {
        title: 'Personal Care',
        description:
            'Shop shampoo, soap, skincare and personal care products online at Rooto. Fast home delivery.',
        emoji: '🧴',
    },
}

// ─── SEO Metadata per category ───────────────────────────────────────────────
// A category is only indexable while the shop actually has products in it.
// Today the catalogue is fruit-only, so these pages are noindex (and left out
// of the sitemap) until the admin adds products to that category.
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const category = CATEGORIES[slug]

    if (!category) return { title: 'Category not found', robots: { index: false, follow: true } }

    const products = await getCategoryProducts(slug)
    const canonical = `${SITE_URL}/category/${slug}`

    return {
        title: category.title,
        description: category.description,
        alternates: { canonical },
        robots: products.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
        openGraph: {
            title: `${category.title} | Rooto`,
            description: category.description,
            url: canonical,
        },
    }
}

export async function generateStaticParams() {
    return Object.keys(CATEGORIES).map((slug) => ({ slug }))
}

// ─── Server: products for this category (live list endpoint) ────────────────
async function getCategoryProducts(slug: string) {
    const dbName = (CATEGORY_DB_NAME[slug] || '').toLowerCase()
    if (!dbName) return []
    const all = await getCatalog(300)
    return all
        .filter((p) => (p.category || '').toLowerCase() === dbName)
        .map((p) => ({ ...p, price: p.price_per_kg, category: p.category || '', description: p.description || '' }))
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const category = CATEGORIES[slug]

    if (!category) notFound()

    const products = await getCategoryProducts(slug)

    const crumbs = [
        { name: 'Home', href: '/' },
        { name: 'Fruits', href: '/products' },
        { name: category.title, href: `/category/${slug}` },
    ]

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.title} | Rooto`,
        description: category.description,
        url: `${SITE_URL}/category/${slug}`,
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <JsonLd data={collectionSchema} />
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <Breadcrumbs items={crumbs} />
                </div>
                {/* ── Hero Banner ───────────────────────────────────── */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-10 px-4 mt-3">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl">{category.emoji}</span>
                            <div>
                                <h1 className="text-3xl font-bold">{category.title}</h1>
                                <p className="text-green-100 mt-1 text-sm">{category.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <PromoStrip placement="category" className="mt-6" />

                {/* ── Product Grid (Client for cart/wishlist) ────────── */}
                <section className="max-w-7xl mx-auto px-4 py-8">
                    <CategoryClient initialProducts={products} categoryTitle={category.title} />
                </section>
            </main>
            <Footer />
        </div>
    )
}