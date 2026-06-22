import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Banner from "@/components/banner"
import Footer from "@/components/footer"
import { HelpCircle, ChevronDown } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Rooto — delivery time, free delivery, cash on delivery, order tracking, cancellations and more.",
  alternates: { canonical: "https://rooto.in/faq" },
}

const faqs = [
  { q: "How long does delivery take?", a: "Most orders are delivered within 1–2 business days across our serviceable areas in India." },
  { q: "Is there a delivery charge?", a: "Delivery is FREE on orders above ₹500. For orders below ₹500, a flat ₹50 delivery fee applies." },
  { q: "Do you offer Cash on Delivery (COD)?", a: "Yes! You can pay with cash at your doorstep when your order arrives." },
  { q: "Which areas do you deliver to?", a: "We currently deliver to selected areas across India and are expanding to new locations regularly." },
  { q: "How do I track my order?", a: "You'll get SMS updates at each step. You can also see live status anytime on your My Orders page." },
  { q: "Can I cancel my order?", a: "Yes, you can cancel an order from the My Orders page any time before it is dispatched." },
  { q: "What if my order arrives damaged or wrong?", a: "Report it within 24 hours with a photo and we'll arrange a free replacement or full refund. See our Returns page for details." },
  { q: "Do I need an account to order?", a: "You can browse and build your cart as a guest, but you'll need to log in to place an order and check out." },
  { q: "Are the products fresh?", a: "Absolutely. Every order is hand-picked and packed with care so it reaches you farm-fresh." },
]

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Banner />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-2">
              <HelpCircle className="w-5 h-5" /> Customer Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h1>
            <p className="text-green-50 mt-2 max-w-2xl">Everything you need to know about shopping with Rooto.</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4 font-semibold text-gray-900">
                  <span>{q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 -mt-1 text-sm text-gray-600 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Still have a question? Head to{" "}
            <Link href="/support" className="text-green-600 font-medium hover:underline">Support</Link> and we'll help you out.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
