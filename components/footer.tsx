"use client"

import { useState, useEffect } from "react"
import {
  Phone, Mail, Facebook, Instagram, Twitter,
  Leaf, Truck, ShieldCheck, Clock, ChevronRight, MapPin,
} from "lucide-react"
import Link from "next/link"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoName, setLogoName] = useState("Rooto.in")

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch(`${API_BASE}/get_logo.php`)
        const json = await res.json()
        if (json.status === "success") {
          setLogoUrl(json.logo_url)
          setLogoName(json.logo_name || "Rooto.in")
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadLogo()
  }, [])

  // Existing page links — unchanged
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ]
  const customerService = [
    { href: "/shipping", label: "Shipping Info" },
    { href: "/returns", label: "Returns" },
    { href: "/faq", label: "FAQ" },
    { href: "/support", label: "Support" },
  ]
  // New section — uses your real category routes
  const categories = [
    { href: "/category/fruits-vegetables", label: "Fruits & Vegetables" },
    { href: "/category/dairy-eggs", label: "Dairy & Eggs" },
    { href: "/category/bakery", label: "Bakery" },
    { href: "/category/beverages", label: "Beverages" },
    { href: "/category/snacks", label: "Snacks" },
  ]
  const trust = [
    { icon: Leaf, label: "100% Fresh & Organic" },
    { icon: Truck, label: "Fast Doorstep Delivery" },
    { icon: ShieldCheck, label: "Secure Checkout" },
    { icon: Clock, label: "Easy Returns" },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-8">

        {/* ── Contact highlight ── */}
        <div className="grid gap-3 sm:grid-cols-2 mb-10">
          <a
            href="tel:+919677028737"
            className="flex items-center gap-3 bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-4 transition"
          >
            <span className="w-11 h-11 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-400" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] text-gray-400">Call us</span>
              <span className="block text-white font-semibold">+91 96770 28737</span>
            </span>
          </a>
          <a
            href="mailto:tallk@rooto.in"
            className="flex items-center gap-3 bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-4 transition"
          >
            <span className="w-11 h-11 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-green-400" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] text-gray-400">Email us</span>
              <span className="block text-white font-semibold truncate">tallk@rooto.in</span>
            </span>
          </a>
        </div>

        {/* ── Link grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold text-base mb-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                  R
                </div>
              )}
              <span className="text-white text-lg">{logoName}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Fresh, organic fruits &amp; groceries delivered straight to your door across India.
            </p>
            <div className="flex items-center gap-2 mt-3 text-gray-400 text-xs">
              <MapPin className="w-4 h-4 text-green-400" /> Serving across India
            </div>
            {/* Social */}
            <div className="flex gap-2 mt-4">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/rooto_in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition">
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop by Category (NEW) */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Shop by Category</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition">
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              {customerService.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition">
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-gray-800">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-xs text-gray-300 font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>&copy; {currentYear} {logoName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
          <p className="flex items-center gap-1">Made with <span className="text-green-400">&#9829;</span> in India</p>
        </div>
      </div>
    </footer>
  )
}
