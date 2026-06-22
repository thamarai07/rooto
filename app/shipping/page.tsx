import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Banner from "@/components/banner"
import Footer from "@/components/footer"
import { Truck, IndianRupee, MapPin, MessageSquare, Wallet, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Shipping Information",
  description:
    "Rooto delivery details — delivery time, charges, free delivery over ₹500, serviceable areas, order tracking and cash on delivery.",
  alternates: { canonical: "https://rooto.in/shipping" },
}

export default function ShippingPage() {
  const cards = [
    { icon: Clock, title: "Delivery Time", desc: "Orders are delivered within 1–2 business days across our serviceable areas." },
    { icon: IndianRupee, title: "Delivery Charges", desc: "FREE delivery on orders above ₹500. A flat ₹50 fee applies below ₹500." },
    { icon: MapPin, title: "Serviceable Areas", desc: "We currently deliver across select areas in India and are expanding fast." },
    { icon: MessageSquare, title: "Order Updates", desc: "You'll receive order status updates over SMS at every step." },
    { icon: Wallet, title: "Cash on Delivery", desc: "Pay conveniently with cash when your fresh order arrives at your doorstep." },
    { icon: Truck, title: "Fresh & Careful", desc: "Every order is hand-packed and handled with care to stay farm-fresh." },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Banner />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-2">
              <Truck className="w-5 h-5" /> Customer Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Shipping Information</h1>
            <p className="text-green-50 mt-2 max-w-2xl">
              Fresh fruits and groceries, delivered fast and carefully to your doorstep.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-6 text-sm text-green-900">
            <p className="font-semibold mb-1">Tip: Unlock free delivery</p>
            <p>Add items worth ₹500 or more to your cart and your delivery is on us. 🎉</p>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Questions about your delivery? Visit our{" "}
            <Link href="/support" className="text-green-600 font-medium hover:underline">Support</Link> page or check the{" "}
            <Link href="/faq" className="text-green-600 font-medium hover:underline">FAQ</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
