"use client"

import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-base mb-3">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">
                F
              </div>
              <span>FruitHub</span>
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
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Customer Service</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/shipping" className="hover:text-white transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Get in Touch</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href="mailto:hello@fruithub.com" className="hover:text-white transition">
                  hello@fruithub.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href="tel:+15551234567" className="hover:text-white transition">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex gap-3 mt-2">
                <a href="#" aria-label="Facebook" className="hover:text-white transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Twitter" className="hover:text-white transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Instagram" className="hover:text-white transition">
                  <Instagram className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
            <p>&copy; {currentYear} FruitHub. All rights reserved.</p>
            <div className="flex gap-3">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}