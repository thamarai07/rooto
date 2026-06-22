import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Banner from "@/components/banner"
import Footer from "@/components/footer"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Rooto collects, uses and protects your personal information when you shop with us.",
  alternates: { canonical: "https://rooto.in/privacy" },
}

const sections = [
  {
    h: "1. Information we collect",
    p: [
      "Account details you provide — your name, email address and phone number.",
      "Delivery details — your saved addresses and, with your permission, your location (GPS) to help you set an accurate delivery address.",
      "Order information — the items you buy, order history and payment method (e.g. Cash on Delivery).",
      "Basic device and usage information that helps us keep the site secure and working well.",
    ],
  },
  {
    h: "2. How we use your information",
    p: [
      "To process, pack and deliver your orders and send you order updates over SMS.",
      "To verify your phone number and secure your account (via Firebase phone OTP).",
      "To provide customer support and respond to your requests.",
      "To improve our products, service and overall shopping experience.",
    ],
  },
  {
    h: "3. Cookies & local storage",
    p: [
      "We use your browser's local storage to remember your cart and wishlist so they're ready when you return.",
      "We use only the cookies needed for the site to function and to keep you signed in.",
    ],
  },
  {
    h: "4. Sharing your information",
    p: [
      "We share information only as needed to run the service — for example with delivery partners to fulfil your order, and with secure providers for phone verification.",
      "We do not sell your personal information to anyone.",
    ],
  },
  {
    h: "5. Data security",
    p: [
      "We take reasonable technical and organisational measures to protect your information. No method of transmission over the internet is 100% secure, but we work hard to safeguard your data.",
    ],
  },
  {
    h: "6. Your rights",
    p: [
      "You can access, update or request deletion of your personal information at any time by contacting us.",
      "You can manage your saved addresses from your account, and your cart/wishlist data stays in your browser.",
    ],
  },
  {
    h: "7. Children's privacy",
    p: ["Rooto is intended for adults. We do not knowingly collect personal information from children."],
  },
  {
    h: "8. Changes to this policy",
    p: ["We may update this policy from time to time. We'll post the updated version here with a new date."],
  },
]

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Banner />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-2">
              <ShieldCheck className="w-5 h-5" /> Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
            <p className="text-green-50 mt-2">Last updated: June 2026</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
            <p className="text-gray-600 leading-relaxed">
              At Rooto, your privacy matters. This policy explains what information we collect, how we use it, and the choices you have.
            </p>
            {sections.map(({ h, p }) => (
              <div key={h}>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{h}</h2>
                <ul className="space-y-2">
                  {p.map((line, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="text-green-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact us</h2>
              <p className="text-sm text-gray-600">
                Questions about your privacy? Email{" "}
                <a href="mailto:tallk@rooto.in" className="text-green-600 font-medium hover:underline">tallk@rooto.in</a>{" "}
                or call{" "}
                <a href="tel:+919677028737" className="text-green-600 font-medium hover:underline">+91 96770 28737</a>.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            See also our{" "}
            <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
