import Header from "@/components/header";
import Banner from "@/components/banner";
import ProductGrid from "@/components/product-grid";
import Footer from "@/components/footer";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky wrapper for both header + search bar */}
      <div className="sticky top-0 z-[50]">
        <Header />
        <Banner />
      </div>
      <main className="flex-1">
        <ProductGrid />
      </main>
      <Footer />
    </div>
  )
}

export const revalidate = 300;