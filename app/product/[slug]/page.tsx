// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";
import Footer from "@/components/footer";
import Header from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api";

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