// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PromoStrip from "@/components/PromoStrip";
import Link from "next/link";
import { API_BASE, IMAGE_BASE, SITE_URL } from "@/lib/config";
import { CATEGORY_DB_NAME, shortName, whatsappLink } from "@/lib/catalog";
import { AREAS, DELIVERY_INFO } from "@/lib/areas";

async function getProduct(slug: string) {
  try {
    const decodedSlug = decodeURIComponent(slug);

    const res = await fetch(
      `${API_BASE}/get_product.php?slug=${encodeURIComponent(decodedSlug)}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (data.status !== "success" || !data.product) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────
// Strip HTML/markup + collapse whitespace, for use in <meta> / JSON-LD text.
function plainText(input?: string | null): string {
  return String(input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Resolve a product's first image to an absolute URL (images are stored as a
// bare filename, sometimes comma-separated). Falls back to the site OG image.
function productImageUrl(image?: string | null): string {
  const file = String(image || "").split(",")[0].trim();
  if (!file) return `${SITE_URL}/opengraph-image.png`;
  if (/^https?:\/\//i.test(file)) return file;
  return `${IMAGE_BASE}/${file}`;
}

// UN/CEFACT unit codes for the per-unit price in the Offer schema.
function unitCode(unit?: string | null): string {
  switch (String(unit || "kg").toLowerCase()) {
    case "piece": return "H87";
    case "dozen": return "DZN";
    case "pack": return "NMP";
    case "bunch": return "H87";
    default: return "KGM";
  }
}

// Map the DB category name to an existing /category/<slug> route, if one exists.
// ("Fruits" has none on purpose — /products is the fruit listing.)
const CATEGORY_SLUG_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_DB_NAME).map(([slug, name]) => [name.toLowerCase(), slug]),
);

// Per-product SEO metadata — each product gets its own title, description, og image
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const productData = await getProduct(slug)

  if (!productData?.product) {
    return { title: "Product not found", robots: { index: false, follow: true } }
  }

  const { product } = productData
  const canonical = `${SITE_URL}/product/${slug}`
  const imageUrl = productImageUrl(product.image)

  const rawDesc = plainText(product.meta_description || product.description)
  const description = rawDesc
    ? rawDesc.length > 160
      ? `${rawDesc.slice(0, 157)}…`
      : rawDesc
    : `Buy fresh ${shortName(product.name).toLowerCase()} online from Rooto with home delivery across South Chennai. Free delivery above ₹${DELIVERY_INFO.freeAbove}.`

  // If the CMS meta_title already carries the brand, bypass the "%s | Rooto"
  // template so we don't get "… | Rooto | Rooto".
  const metaTitle = plainText(product.meta_title)
  const title = metaTitle
    ? /\brooto\b/i.test(metaTitle)
      ? { absolute: metaTitle }
      : metaTitle
    : `Buy Fresh ${shortName(product.name)} Online in Chennai`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} | Rooto`,
      description,
      url: canonical,
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Rooto`,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const productData = await getProduct(slug);

  if (!productData) {
    notFound();
    return null; // Ensure execution stops here in Edge runtime
  }

  const { product, related_products: relatedProducts = [] } = productData;

  const canonical = `${SITE_URL}/product/${slug}`;
  const inStock = Number(product.stock) > 0;
  const price = Number(product.final_price ?? product.price_per_kg) || 0;

  // Breadcrumb: Home › Products › [Category] › Product
  const categorySlug = CATEGORY_SLUG_BY_NAME[String(product.category || "").toLowerCase()];
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Fruits", href: "/products" },
    ...(categorySlug
      ? [{ name: product.category as string, href: `/category/${categorySlug}` }]
      : []),
    { name: product.name as string, href: `/product/${slug}` },
  ];

  // Product structured data — only fields backed by real, visible content.
  // No aggregateRating / review: the API's rating figures are placeholders.
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [productImageUrl(product.image)],
    description: plainText(product.description) || `Fresh ${product.name} from Rooto.`,
    sku: String(product.id),
    category: product.category || "Fruits",
    brand: { "@type": "Brand", name: "Rooto" },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", "@id": `${SITE_URL}/#business`, name: "Rooto" },
      // The price is per unit (usually per kg) — say so, so it isn't read as
      // the price of a single fruit.
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: price.toFixed(2),
        priceCurrency: "INR",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: unitCode(product.unit),
        },
      },
    },
  };

  const fruit = shortName(String(product.name)).toLowerCase();
  const deliveryAreas = AREAS.filter((a) => a.tier === "primary").slice(0, 6);
  const waOrder = whatsappLink(`Hi Rooto! I'd like to order ${product.name}. My address: `);

  return (
    <>
      <Header />
      <JsonLd data={productSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <Breadcrumbs items={crumbs} />
      </div>
      <ClientProductPage initialProduct={product} relatedProducts={relatedProducts} />

      {/* Delivery + ordering facts (server-rendered, crawlable). Only verified
          policy: delivery fee/threshold from lib/pricing, COD, WhatsApp. */}
      <section className="mx-auto max-w-7xl px-4 pb-4" aria-labelledby="product-delivery-heading">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 id="product-delivery-heading" className="text-lg font-bold text-gray-900">
            {fruit.charAt(0).toUpperCase() + fruit.slice(1)} delivery in South Chennai
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Order fresh {fruit} online and get it delivered to your home. Delivery is free on orders above
            ₹{DELIVERY_INFO.freeAbove} (otherwise a flat ₹{DELIVERY_INFO.feeBelow}), and you can pay cash on delivery or
            online. Prefer chatting?{" "}
            <a href={waOrder} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
              Order {fruit} on WhatsApp
            </a>
            .
          </p>
          <p className="mt-3 text-sm text-gray-600">
            We deliver to{" "}
            {deliveryAreas.map((a, i) => (
              <span key={a.slug}>
                <Link href={`/areas/${a.slug}`} className="text-green-700 hover:underline">{a.name}</Link>
                {i < deliveryAreas.length - 1 ? ", " : " "}
              </span>
            ))}
            and <Link href="/areas" className="font-medium text-green-700 hover:underline">more areas</Link>.{" "}
            <Link href="/products" className="font-medium text-green-700 hover:underline">See all fresh fruits</Link>
          </p>
        </div>
      </section>
      <PromoStrip placement="product" className="my-8" />
      <Footer />
    </>
  )
}
