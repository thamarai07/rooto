// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";
import Footer from "@/components/footer";
import Header from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

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

// Per-product SEO metadata — each product gets its own title, description, og image
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const productData = await getProduct(slug)

  if (!productData?.product) return {}

  const { product } = productData
  const BASE_URL = 'https://rooto.in'
  const imageUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `${process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') || 'https://seashell-skunk-617240.hostingersite.com/vfs-admin'}/${product.image_url}`
    : `${BASE_URL}/opengraph-image.png`

  return {
    title: product.name,
    description: product.description
      ? `${product.description.slice(0, 150)}...`
      : `Buy ${product.name} online at Rooto. Fast delivery to your doorstep.`,
    alternates: {
      canonical: `${BASE_URL}/product/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Rooto`,
      description: product.description || `Buy ${product.name} at Rooto`,
      url: `${BASE_URL}/product/${slug}`,
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
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

  return (
    <>
      <Header />
      <ClientProductPage initialProduct={product} relatedProducts={relatedProducts} />
      <Footer />
    </>
  )
}