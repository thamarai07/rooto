import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

// Rendered for any unmatched route. Next.js serves this with a 404 status and
// marks it noindex automatically.
export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg text-center">
          <p className="text-6xl font-black text-green-600">404</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            This page could not be found
          </h1>
          <p className="mt-3 text-gray-600">
            The page you are looking for may have moved or no longer exists.
            Let&apos;s get you back to the fresh fruit.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Go to homepage
            </Link>
            <Link
              href="/products"
              className="rounded-lg border-2 border-green-300 px-5 py-2.5 font-semibold text-green-700 transition hover:border-green-400"
            >
              Browse all fruits
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-500">Fruit delivery areas</p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
              {[
                ["Medavakkam", "medavakkam"],
                ["Pallikaranai", "pallikaranai"],
                ["Tambaram", "tambaram"],
                ["Velachery", "velachery"],
                ["Chromepet", "chromepet"],
                ["Madipakkam", "madipakkam"],
              ].map(([label, slug]) => (
                <Link key={slug} href={`/areas/${slug}`} className="text-green-700 hover:underline">
                  {label}
                </Link>
              ))}
              <Link href="/areas" className="font-medium text-green-700 hover:underline">
                All areas
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
