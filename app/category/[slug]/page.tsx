// app/category/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import CategoryClient from './CategoryClient'

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    'https://seashell-skunk-617240.hostingersite.com/vfs-admin/api'

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES: Record<string, { title: string; description: string; emoji: string }> = {
    'fruits-vegetables': {
        title: 'Fresh Fruits & Vegetables',
        description:
            'Buy fresh fruits and vegetables online at Rooto. Farm-fresh produce delivered daily to your doorstep.',
        emoji: '🥦',
    },
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
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const category = CATEGORIES[slug]

    if (!category) return {}

    return {
        title: category.title,
        description: category.description,
        alternates: {
            canonical: `https://rooto.in/category/${slug}`,
        },
        openGraph: {
            title: `${category.title} | Rooto`,
            description: category.description,
            url: `https://rooto.in/category/${slug}`,
        },
    }
}

export async function generateStaticParams() {
    return Object.keys(CATEGORIES).map((slug) => ({ slug }))
}

// ─── Server component: fetch products for this category ──────────────────────
async function getCategoryProducts(categoryName: string) {
    try {
        const res = await fetch(`${API_BASE}/get-products.php`, {
            next: { revalidate: 300 }, // revalidate every 5 minutes
        })
        if (!res.ok) return []
        const data = await res.json()
        if (data.status !== 'success') return []

        // Filter by category (case-insensitive match)
        return (data.data as any[]).filter(
            (p) => p.category?.toLowerCase() === categoryName.toLowerCase()
        )
    } catch {
        return []
    }
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

    // Map slug → category name used in DB (handle common variants)
    const categoryNameMap: Record<string, string> = {
        'fruits-vegetables': 'Fruits & Vegetables',
        'dairy-eggs': 'Dairy & Eggs',
        bakery: 'Bakery',
        beverages: 'Beverages',
        snacks: 'Snacks',
        household: 'Household',
        'personal-care': 'Personal Care',
    }

    const products = await getCategoryProducts(categoryNameMap[slug] || category.title)

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                {/* ── Hero Banner ───────────────────────────────────── */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-10 px-4">
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

                {/* ── Product Grid (Client for cart/wishlist) ────────── */}
                <section className="max-w-7xl mx-auto px-4 py-8">
                    <CategoryClient initialProducts={products} categoryTitle={category.title} />
                </section>
            </main>
            <Footer />
        </div>
    )
}