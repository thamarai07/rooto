import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Banner from "@/components/banner"
import Footer from "@/components/footer"
import { RotateCcw, Camera, Clock, Wallet, XCircle, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Rooto returns and refunds policy for fresh produce — report damaged or wrong items within 24 hours for a free replacement or refund.",
  alternates: { canonical: "https://rooto.in/returns" },
}

export default function ReturnsPage() {
  const steps = [
    { icon: Clock, title: "Report within 24 hours", desc: "If something's wrong with your order, contact us within 24 hours of delivery." },
    { icon: Camera, title: "Share a photo", desc: "Send a quick photo of the item along with your order number — it helps us act fast." },
    { icon: CheckCircle2, title: "Replacement or refund", desc: "We'll arrange a free replacement or issue a full refund for the affected item." },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Banner />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-2">
              <RotateCcw className="w-5 h-5" /> Customer Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Returns &amp; Refunds</h1>
            <p className="text-green-50 mt-2 max-w-2xl">
              Your satisfaction matters. Here's how we handle issues with fresh orders.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Our promise on fresh produce</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Because fruits and groceries are perishable, we're unable to accept returns once an order has been delivered and accepted.
              But if anything arrives damaged, spoiled, or incorrect, we'll make it right — quickly and free of charge.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <Wallet className="w-5 h-5 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Refund timeline</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Approved refunds for prepaid orders are returned to the original payment method within 5–7 business days.
                For Cash on Delivery orders, we'll refund via UPI or bank transfer.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <XCircle className="w-5 h-5 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Cancellations</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                You can cancel an order before it's dispatched from your{" "}
                <Link href="/orders" className="text-green-600 font-medium hover:underline">My Orders</Link> page.
                Once out for delivery, an order can no longer be cancelled.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Need help with a return? Reach our{" "}
            <Link href="/support" className="text-green-600 font-medium hover:underline">Support</Link> team — we're happy to assist.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
