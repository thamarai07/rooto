export const runtime = "edge";

// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";
import Footer from "@/components/footer";
import Header from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/vfs_portal/vfs-admin/api";

async function getProduct(slug: string) {
  try {
    // Decode the slug before sending to API
    const decodedSlug = decodeURIComponent(slug);

    console.log("Fetching product with slug:", decodedSlug); // Debug log

    const res = await fetch(
      `${API_BASE}/get_product.php?slug=${encodeURIComponent(decodedSlug)}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(`API returned status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log("API response:", data); // Debug log

    if (data.status !== "success" || !data.product) {
      console.error("Product not found in API response");
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

  console.log("Page slug received:", slug); // Debug log

  const productData = await getProduct(slug);

  if (!productData) {
    notFound();
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