import Link from "next/link"
import { type CatalogProduct, formatRupees } from "@/lib/catalog"

// Server component: a plain, crawlable list of today's fruit prices, read from
// the live catalog. Every row links to the product page (internal linking) and
// nothing is hard-coded — when the admin changes a price or stock, this list
// follows on the next revalidation.
export default function FruitPriceList({
  products,
  caption,
}: {
  products: CatalogProduct[]
  caption?: string
}) {
  if (products.length === 0) return null
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Fruit</th>
            <th scope="col" className="px-4 py-2.5 font-semibold">Price</th>
            <th scope="col" className="hidden px-4 py-2.5 font-semibold sm:table-cell">Per piece</th>
            <th scope="col" className="px-4 py-2.5 font-semibold">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2.5">
                <Link href={`/product/${encodeURIComponent(p.slug)}`} className="font-medium text-gray-900 hover:text-green-700 hover:underline">
                  {p.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 font-semibold text-green-700">
                ₹{formatRupees(p.final_price)}
                <span className="font-normal text-gray-400">/{p.unit || "kg"}</span>
                {p.discount_percent > 0 && (
                  <span className="ml-1.5 text-xs font-medium text-red-600">{p.discount_percent}% off</span>
                )}
              </td>
              <td className="hidden px-4 py-2.5 text-gray-600 sm:table-cell">
                {p.piece_price ? `₹${formatRupees(p.piece_price)}` : "—"}
              </td>
              <td className="px-4 py-2.5 text-gray-600">{p.in_stock ? "In stock" : "Out of stock"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
