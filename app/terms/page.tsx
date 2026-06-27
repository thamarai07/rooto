import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Banner from "@/components/banner"
import Footer from "@/components/footer"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions for using Rooto and placing orders for fresh fruits and groceries.",
  alternates: { canonical: "https://rooto.in/terms" },
}

const sections = [
  {
    h: "1. Acceptance of terms",
    p: ["By browsing Rooto or placing an order, you agree to these Terms of Service. If you do not agree, please do not use the service."],
  },
  {
    h: "2. Your account",
    p: [
      "You need an account to place an order. You're responsible for keeping your login details secure and for activity under your account.",
      "Please provide accurate contact and delivery information so we can fulfil your orders.",
    ],
  },
  {
    h: "3. Orders & pricing",
    p: [
      "All prices are listed in Indian Rupees (₹) and may change without notice.",
      "Applicable taxes and a delivery fee (where it applies) are shown at checkout before you confirm.",
      "We may cancel or limit an order in cases such as product unavailability or suspected fraud.",
    ],
  },
  {
    h: "4. Payment",
    p: ["We accept Cash on Delivery and supported online payment methods. Payment must be completed as per the selected method."],
  },
  {
    h: "5. Delivery",
    p: [
      "We aim to deliver within 1 hour in our serviceable areas. Delivery times are estimates and may vary.",
      "Please ensure someone is available to receive the order at the provided address.",
    ],
  },
  {
    h: "6. Cancellations, returns & refunds",
    p: ["You may cancel before dispatch. For damaged, spoiled or wrong items, our Returns & Refunds policy applies."],
  },
  {
    h: "7. Acceptable use",
    p: ["You agree not to misuse the service, attempt to disrupt it, or use it for any unlawful purpose."],
  },
  {
    h: "8. Intellectual property",
    p: ["All content on Rooto — including the brand, logo, text and images — belongs to Rooto and may not be used without permission."],
  },
  {
    h: "9. Limitation of liability",
    p: ["Rooto is provided on an 'as is' basis. To the extent permitted by law, we are not liable for indirect or incidental damages arising from use of the service."],
  },
  {
    h: "10. Governing law",
    p: ["These terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts in India."],
  },
  {
    h: "11. Changes to these terms",
    p: ["We may update these terms from time to time. Continued use of Rooto after changes means you accept the updated terms."],
  },
]

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Banner />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-2">
              <FileText className="w-5 h-5" /> Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Terms of Service</h1>
            <p className="text-green-50 mt-2">Last updated: June 2026</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
            <p className="text-gray-600 leading-relaxed">
              Welcome to Rooto. These terms explain the rules for using our website and ordering fresh fruits and groceries from us.
            </p>
            {sections.map(({ h, p }) => (
              <div key={h}>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{h}</h2>
                <ul className="space-y-2">
                  {p.map((line, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-2">12. Contact us</h2>
              <p className="text-sm text-gray-600">
                Questions about these terms? Email{" "}
                <a href="mailto:talk@rooto.in" className="text-green-600 font-medium hover:underline">talk@rooto.in</a>{" "}
                or call{" "}
                <a href="tel:+919677028737" className="text-green-600 font-medium hover:underline">+91 96770 28737</a>.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            See also our{" "}
            <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
