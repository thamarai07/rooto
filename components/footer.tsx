"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"
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

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-base mb-3">
              {/* ← Dynamic logo same as header */}
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">
                  R
                </div>
              )}
              <span className="text-white">{logoName}</span>
            </div>
            <p className="text-gray-400 text-xs">
              Fresh, organic fruits delivered straight to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Quick Links</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">Products</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Customer Service</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/shipping" className="hover:text-white transition">Shipping Info</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">Returns</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">FAQ</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition">Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Get in Touch</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href="mailto:hello@rooto.in" className="hover:text-white transition">
                  hello@rooto.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href="tel:+15551234567" className="hover:text-white transition">
                  +1 (555) 123-4567
                </a>
              </li>
              {/* ← Updated social links with your Instagram */}
              <li className="flex gap-3 mt-2">
                <a href="#" aria-label="Facebook" className="hover:text-white transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Twitter" className="hover:text-white transition">
                  <Twitter className="w-5 h-5" />
                </a>

                <a href="https://www.instagram.com/rooto_in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-pink-400 transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
            <p>&copy; {currentYear} {logoName}. All rights reserved.</p>
            <div className="flex gap-3">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}