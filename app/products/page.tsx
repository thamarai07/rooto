// app/products/page.tsx
import ProductsPageLayout from "@/components/ProductsPageLayout"
import CategoryProductView from "@/components/CategoryProductView"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"

export default function ProductsPage() {
  return (
     <div className="flex flex-col min-h-screen">
          <Header />
    <ProductsPageLayout>
      {/* <CategoryProductView /> */}
        <ProductGrid />

    </ProductsPageLayout>
     <Footer />
        </div>
  )
}