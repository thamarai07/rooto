import Link from "next/link"
import { ChevronRight } from "lucide-react"
import JsonLd from "./JsonLd"

export type Crumb = { name: string; href: string }

const SITE_URL = "https://rooto.in"

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD.
 * `items` is ordered root → current. The last item renders as plain text
 * (the current page) and is still included in the structured data.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items || items.length === 0) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.href} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="font-medium text-gray-700" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-green-700 hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
      <JsonLd data={jsonLd} />
    </nav>
  )
}
