
import Header from "@/components/header";
import Banner from "@/components/banner";
import ProductGrid from "@/components/product-grid";
import Footer from "@/components/footer";
export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Banner />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}

export const revalidate = 300;