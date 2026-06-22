import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Banner from "@/components/banner"
import Footer from "@/components/footer"
import { LifeBuoy, Phone, Mail, Instagram, Truck, RotateCcw, HelpCircle, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Need help with your Rooto order? Call, email or message us — plus quick links to shipping, returns and FAQ.",
  alternates: { canonical: "https://rooto.in/support" },
}

export default function SupportPage() {
  const contacts = [
    { icon: Phone, label: "Call us", value: "+91 96770 28737", href: "tel:+919677028737" },
    { icon: Mail, label: "Email us", value: "talk@rooto.in", href: "mailto:talk@rooto.in" },
    { icon: Instagram, label: "Message on Instagram", value: "@rooto_in", href: "https://www.instagram.com/rooto_in/" },
  ]
  const quick = [
    { icon: Truck, title: "Shipping Info", href: "/shipping" },
    { icon: RotateCcw, title: "Returns & Refunds", href: "/returns" },
    { icon: HelpCircle, title: "FAQ", href: "/faq" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Banner />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-2">
              <LifeBuoy className="w-5 h-5" /> Customer Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Help &amp; Support</h1>
            <p className="text-green-50 mt-2 max-w-2xl">We're here to help — reach us any way you like.</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {contacts.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition flex flex-col items-start"
              >
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">{label}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </a>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-semibold">Support hours</p>
              <p>We typically respond within a few hours, every day from 8 AM to 9 PM IST.</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Quick help</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {quick.map(({ icon: Icon, title, href }) => (
                <Link key={href} href={href} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-green-600" />
                  </span>
                  <span className="font-medium text-gray-800 text-sm">{title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
