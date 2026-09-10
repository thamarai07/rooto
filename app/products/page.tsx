// app/products/page.tsx
import type { Metadata } from "next"
import ProductsPageLayout from "@/components/ProductsPageLayout"
import CategoryProductView from "@/components/CategoryProductView"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"

export const metadata: Metadata = {
  title: "Buy Fresh Fruits Online",
  description:
    "Browse Rooto's full range of fresh, hand-picked fruits — seasonal, exotic and everyday favourites — with fast home delivery across South Chennai.",
  alternates: { canonical: "https://rooto.in/products" },
  openGraph: {
    title: "Buy Fresh Fruits Online | Rooto",
    description:
      "Browse Rooto's full range of fresh, hand-picked fruits with fast home delivery across South Chennai.",
    url: "https://rooto.in/products",
  },
}

export default function ProductsPage() {
  return (
     <div className="flex flex-col min-h-screen">
          <Header />
    <ProductsPageLayout>
      <h1 className="sr-only">Buy fresh fruits online — Rooto</h1>
      {/* <CategoryProductView /> */}
        <ProductGrid />

    </ProductsPageLayout>
     <Footer />
        </div>
  )
}