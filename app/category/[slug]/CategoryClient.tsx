'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Heart, Check, Loader2 } from 'lucide-react'

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    'https://seashell-skunk-617240.hostingersite.com/vfs-admin/api'

interface Product {
    id: number
    name: string
    slug?: string
    price: number
    price_per_kg: number
    image: string
    category: string
    description: string
    stock: number
}

interface Props {
    initialProducts: Product[]
    categoryTitle: string
}

export default function CategoryClient({ initialProducts, categoryTitle }: Props) {
    const [products] = useState<Product[]>(initialProducts)
    const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
    const [loadingItem, setLoadingItem] = useState<number | null>(null)
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set())

    // Fetch wishlist on mount
    useEffect(() => {
        fetch(`${API_BASE}/wishlist.php`)
            .then((r) => r.json())
            .then((data) => {
                if (data.status === 'success') {
                    setWishlistIds(new Set(data.data.map((i: any) => Number(i.id))))
                }
            })
            .catch(console.error)
    }, [])

    // Listen to wishlist updates from other components
    useEffect(() => {
        const handleUpdate = () => {
            fetch(`${API_BASE}/wishlist.php`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.status === 'success') {
                        setWishlistIds(new Set(data.data.map((i: any) => Number(i.id))))
                    }
                })
                .catch(console.error)
        }
        window.addEventListener('wishlist-updated', handleUpdate)
        return () => window.removeEventListener('wishlist-updated', handleUpdate)
    }, [])

    const addToCart = async (product: Product, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoadingItem(product.id)
        try {
            const res = await fetch(`${API_BASE}/cart.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id, quantity: 0.25 }),
            })
            const data = await res.json()
            if (data.status === 'success') {
                setAddedItems((prev) => new Set(prev).add(product.id))
                setTimeout(() => {
                    setAddedItems((prev) => {
                        const s = new Set(prev)
                        s.delete(product.id)
                        return s
                    })
                }, 1500)
                window.dispatchEvent(
                    new CustomEvent('celebrate-action', { detail: { action: 'cart-add', product } })
                )
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingItem(null)
        }
    }

    const toggleWishlist = async (product: Product, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoadingItem(product.id)
        const isWishlisted = wishlistIds.has(product.id)
        try {
            const method = isWishlisted ? 'DELETE' : 'POST'
            const url = isWishlisted
                ? `${API_BASE}/wishlist.php?product_id=${product.id}`
                : `${API_BASE}/wishlist.php`
            const res = await fetch(url, {
                method,
                headers: !isWishlisted ? { 'Content-Type': 'application/json' } : {},
                body: !isWishlisted ? JSON.stringify({ product_id: product.id }) : undefined,
            })
            const data = await res.json()
            if (data.status === 'success' || data.status === 'info') {
                setWishlistIds((prev) => {
                    const set = new Set(prev)
                    isWishlisted ? set.delete(product.id) : set.add(product.id)
                    return set
                })
                window.dispatchEvent(
                    new CustomEvent('celebrate-action', {
                        detail: { action: isWishlisted ? 'wishlist-remove' : 'wishlist-add', product },
                    })
                )
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingItem(null)
        }
    }

    // ──────────────────────────────────────────────────────────────────────────

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-xl font-semibold text-gray-700">No products in {categoryTitle} yet</h2>
                <p className="text-gray-500 mt-2">Check back soon — we update daily!</p>
                <a
                    href="/products"
                    className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
                >
                    Browse all products
                </a>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{products.length} products found</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.map((product) => {
                    const isWishlisted = wishlistIds.has(product.id)
                    const isAdded = addedItems.has(product.id)
                    const isLoading = loadingItem === product.id
                    const href = product.slug
                        ? `/product/${product.slug}`
                        : `/product-details/${encodeURIComponent(product.name)}`

                    return (
                        <a
                            key={product.id}
                            href={href}
                            className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Image */}
                            <div className="aspect-square relative bg-gray-50">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.stock < 20 && (
                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        Low
                                    </span>
                                )}
                                <button
                                    onClick={(e) => toggleWishlist(product, e)}
                                    disabled={isLoading}
                                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
                                        }`}
                                >
                                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h2 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                    {product.name}
                                </h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-green-600 font-bold text-sm">₹{product.price_per_kg}</span>
                                        <span className="text-xs text-gray-500">/kg</span>
                                    </div>
                                    <button
                                        onClick={(e) => addToCart(product, e)}
                                        disabled={isLoading || product.stock === 0}
                                        className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${isAdded ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isAdded ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <ShoppingCart className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </a>
                    )
                })}
            </div>
        </>
    )
}
