import Header from "@/components/header";
import Banner from "@/components/banner";
import ProductGrid from "@/components/product-grid";
import Footer from "@/components/footer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

// Fetch the home cards on the SERVER so they're already in the HTML.
// Cached for 5 min (matches `revalidate`), so most visitors hit a warm cache
// instead of waiting on a cold connection to Hostinger after hydration.
async function getInitialProducts() {
  try {
    const res = await fetch(`${API_BASE}/get-product.php?limit=12`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.status === "success" ? data.items : [];
  } catch {
    return []; // fall back to client fetch inside ProductGrid
  }
}

export default async function Home() {
  const initialProducts = await getInitialProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky wrapper for both header + search bar */}
      <div className="sticky top-0 z-[50]">
        <Header />
        <Banner />
      </div>
      <main className="flex-1">
        <ProductGrid initialProducts={initialProducts} />
      </main>
      <Footer />
    </div>
  )
}

export const revalidate = 300;
