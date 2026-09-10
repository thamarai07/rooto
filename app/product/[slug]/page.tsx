// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { API_BASE, IMAGE_BASE, SITE_URL } from "@/lib/config";

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

// Map the DB category name to an existing /category/<slug> route, if one exists.
const CATEGORY_SLUG_BY_NAME: Record<string, string> = {
  "fruits & vegetables": "fruits-vegetables",
  "dairy & eggs": "dairy-eggs",
  bakery: "bakery",
  beverages: "beverages",
  snacks: "snacks",
  household: "household",
  "personal care": "personal-care",
};

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
    : `Buy fresh ${product.name} online from Rooto with fast home delivery across South Chennai.`

  // If the CMS meta_title already carries the brand, bypass the "%s | Rooto"
  // template so we don't get "… | Rooto | Rooto".
  const metaTitle = plainText(product.meta_title)
  const title = metaTitle
    ? /\brooto\b/i.test(metaTitle)
      ? { absolute: metaTitle }
      : metaTitle
    : product.name

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
      seller: { "@type": "Organization", name: "Rooto" },
    },
  };

  return (
    <>
      <Header />
      <JsonLd data={productSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <Breadcrumbs items={crumbs} />
      </div>
      <ClientProductPage initialProduct={product} relatedProducts={relatedProducts} />
      <Footer />
    </>
  )
}
