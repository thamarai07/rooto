"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Banner from "@/components/banner";

export default function ContactPage() {
  const [scrollY, setScrollY] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f5f0]" style={{ fontFamily: "'Fraunces', serif" }}>
      <Header />
  <Banner />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,200;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500&display=swap');

        .display { font-family: 'Fraunces', serif; }
        .sans { font-family: 'Outfit', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .anim-fade-up { animation: fadeUp 1s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-1 { animation-delay: 0.1s; }
        .anim-2 { animation-delay: 0.25s; }
        .anim-3 { animation-delay: 0.4s; }
        .anim-4 { animation-delay: 0.55s; }
        .anim-5 { animation-delay: 0.7s; }

        .anim-scale { animation: scaleIn 1s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .anim-left { animation: slideLeft 1s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .anim-right { animation: slideRight 1s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

        .pulse { animation: pulse-glow 2s infinite; }
        .float { animation: float 4s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 20s linear infinite; }

        .contact-card {
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .contact-card:hover {
          transform: translateY(-12px) scale(1.02);
        }

        .img-cover {
          position: relative;
          overflow: hidden;
        }
        .img-cover img {
          transition: transform 0.8s cubic-bezier(0.22,1,0.36,1);
        }
        .img-cover:hover img {
          transform: scale(1.08);
        }

        .marquee-track {
          display: flex;
          gap: 3rem;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .grain {
          position: relative;
        }
        .grain::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        .border-animate {
          position: relative;
          overflow: hidden;
        }
        .border-animate::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #16a34a;
          transition: width 0.4s ease;
        }
        .border-animate:hover::after {
          width: 100%;
        }

        .ig-gradient {
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        }

        .number-outline {
          -webkit-text-stroke: 1px rgba(34,197,94,0.3);
          color: transparent;
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden grain bg-[#0c1a0c]">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1800&q=80')`,
            transform: `translateY(${scrollY * 0.25}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1a0c] via-[#0c1a0c]/80 to-[#0c1a0c]/40" />

        {/* Decorative spinning ring */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden xl:block">
          <div className="w-72 h-72 rounded-full border border-green-500/20 spin-slow" />
          <div className="absolute inset-8 rounded-full border border-green-500/10 spin-slow" style={{ animationDirection: 'reverse', animationDuration: '14s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl float">🌿</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-40">
          {/* Marquee strip */}
          <div className="absolute top-16 left-0 right-0 overflow-hidden opacity-20">
            <div className="marquee-track sans text-green-400 text-xs tracking-widest uppercase">
              {Array(8).fill("Get in Touch · Rooto.in · Fresh Fruits · Healthy Living · ").map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="anim-fade-up anim-1 flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-green-500" />
              <span className="sans text-green-400 tracking-[0.3em] uppercase text-xs font-medium">Contact Us</span>
            </div>

            <h1 className="display anim-fade-up anim-2 font-light text-white leading-[0.9] mb-8" style={{ fontSize: 'clamp(4rem, 11vw, 10rem)' }}>
              Let's<br />
              <em className="text-green-400">Talk</em><br />
              <span className="number-outline" style={{ fontSize: '0.6em' }}>Fresh.</span>
            </h1>

            <p className="sans anim-fade-up anim-3 text-gray-400 text-xl font-light max-w-lg leading-relaxed">
              Have a question, feedback, or just want to say hello? We're here — and we'd love to hear from you.
            </p>

            <div className="anim-fade-up anim-4 mt-12 flex flex-wrap gap-6 items-center">
              <a
                href="https://www.instagram.com/rooto_in/"
                target="_blank"
                rel="noopener noreferrer"
                className="sans flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3.5 transition-all duration-300 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm font-medium tracking-wide">@rooto_in</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 pulse" />
                <span className="sans text-gray-400 text-sm">We respond within 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="sans text-white text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-white/40" />
        </div>
      </section>

      {/* ── CONNECT CHANNELS ─────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-green-600" />
              <span className="sans text-green-600 tracking-[0.25em] uppercase text-xs font-medium">How to Reach Us</span>
            </div>
            <h2 className="display text-5xl lg:text-7xl font-light text-gray-900 leading-tight">
              Every Way to<br /><em className="text-green-600">Connect</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Instagram — Primary */}
            <a
              href="https://www.instagram.com/rooto_in/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card lg:col-span-2 relative overflow-hidden rounded-3xl group cursor-pointer"
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 ig-gradient opacity-90" />
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80')` }}
              />
              <div className="relative z-10 p-10">
                <div className="flex items-start justify-between mb-12">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="sans text-white/80 text-sm border border-white/30 px-3 py-1 rounded-full group-hover:bg-white/20 transition-colors">
                    Follow Us →
                  </span>
                </div>
                <div>
                  <p className="sans text-white/70 text-sm mb-2 tracking-widest uppercase">Find us on Instagram</p>
                  <h3 className="display text-white text-4xl lg:text-5xl font-light">@rooto_in</h3>
                  <p className="sans text-white/80 text-base mt-3 font-light max-w-md">
                    Follow our journey — fresh arrivals, health tips, and daily fruit inspiration. DM us anytime!
                  </p>
                </div>
              </div>
            </a>

            {/* Email — Coming Soon */}
            <div
              className="contact-card relative overflow-hidden rounded-3xl bg-[#0c1a0c] group cursor-default"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&q=80')` }}
              />
              <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[280px]">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="sans text-green-400/60 text-xs tracking-widest uppercase mb-2">Email Us</div>
                  <h3 className="display text-white text-2xl font-light mb-2">hello@rooto.in</h3>
                  <p className="sans text-gray-500 text-sm font-light">
                    Drop us a message — we'll get back to you soon.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 sans text-xs text-green-500/70 border border-green-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Updating soon
                  </div>
                </div>
              </div>
            </div>

            {/* Phone — Coming Soon */}
            <div
              className="contact-card relative overflow-hidden rounded-3xl bg-green-600 group cursor-default"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-700"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1553484771-047a44eee27b?w=600&q=80')` }}
              />
              <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="sans text-white/60 text-xs tracking-widest uppercase mb-2">Phone</div>
                  <h3 className="display text-white text-2xl font-light mb-2">Coming Soon</h3>
                  <p className="sans text-white/70 text-sm font-light">
                    Our customer support line will be live shortly.
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp — Coming Soon */}
            <div
              className="contact-card relative overflow-hidden rounded-3xl bg-[#f0f7f0] border border-green-100 group cursor-default"
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <div className="sans text-green-600/60 text-xs tracking-widest uppercase mb-2">WhatsApp</div>
                  <h3 className="display text-gray-900 text-2xl font-light mb-2">Coming Soon</h3>
                  <p className="sans text-gray-500 text-sm font-light">
                    Chat support launching soon for instant help.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── RESPONSE PROMISE ─────────────────────────────────── */}
      <section className="py-28 bg-[#0c1a0c] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1600&q=80')` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-px bg-white/10">
            {[
              { num: "< 24h", label: "Response Time", desc: "We reply to every message within 24 hours, always." },
              { num: "7 Days", label: "We're Available", desc: "Our team is here Monday to Sunday for your support." },
              { num: "100%", label: "Satisfaction Focus", desc: "Your happiness is our priority — no question is too small." },
            ].map((item, i) => (
              <div key={i} className="bg-[#0c1a0c] p-10 hover:bg-[#162416] transition-colors duration-300 group text-center">
                <p className="display text-green-400 font-light mb-3" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1 }}>
                  {item.num}
                </p>
                <p className="sans text-white font-medium text-lg mb-2 group-hover:text-green-400 transition-colors">{item.label}</p>
                <p className="sans text-gray-500 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ PREVIEW ──────────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-green-600" />
                <span className="sans text-green-600 tracking-[0.25em] uppercase text-xs font-medium">Quick Answers</span>
              </div>
              <h2 className="display text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
                Common<br /><em className="text-green-600">Questions</em>
              </h2>
              <p className="sans text-gray-500 font-light text-base leading-relaxed max-w-sm">
                Here are answers to what people ask us most. Can't find yours? Reach us on Instagram.
              </p>

              <div className="mt-10 img-cover rounded-2xl overflow-hidden h-64 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80"
                  alt="Fresh fruits delivery"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-0">
              {[
                {
                  q: "What areas do you deliver to?",
                  a: "We're currently expanding our delivery network. Follow us on Instagram @rooto_in for the latest updates on delivery zones."
                },
                {
                  q: "How fresh are the fruits?",
                  a: "All our fruits are sourced directly and delivered within 24 hours of harvest. We never compromise on freshness."
                },
                {
                  q: "Can I place a bulk order?",
                  a: "Absolutely! Bulk orders for families, offices, or events are welcome. Reach out to us on Instagram for pricing."
                },
                {
                  q: "What is your return policy?",
                  a: "If you receive anything less than fresh, we'll replace it or refund you — no questions asked. Your satisfaction is guaranteed."
                },
                {
                  q: "How do I track my order?",
                  a: "Once your order is placed, you'll receive real-time updates. Our team personally ensures safe and timely delivery."
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group border-b border-gray-100 py-6 cursor-pointer"
                >
                  <summary className="flex items-center justify-between list-none">
                    <h3 className="display text-gray-900 text-lg font-medium pr-4 group-hover:text-green-600 transition-colors">
                      {faq.q}
                    </h3>
                    <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 group-open:bg-green-600 group-open:border-green-600 transition-colors">
                      <span className="sans text-gray-500 group-open:text-white text-xs transition-colors">+</span>
                    </div>
                  </summary>
                  <p className="sans text-gray-500 text-sm font-light leading-relaxed mt-4 pr-10">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM FEED PREVIEW ───────────────────────────── */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-green-600" />
              <span className="sans text-green-600 tracking-[0.25em] uppercase text-xs font-medium">On Instagram</span>
              <div className="w-8 h-px bg-green-600" />
            </div>
            <h2 className="display text-5xl font-light text-gray-900">
              Follow <em className="text-green-600">@rooto_in</em>
            </h2>
            <p className="sans text-gray-500 mt-3 font-light">Fresh content, health tips, and fruit stories daily</p>
          </div>

          {/* Mosaic grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { img: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80", tall: true },
              { img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80", tall: false },
              { img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80", tall: false },
              { img: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80", tall: true },
              { img: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&q=80", tall: false },
              { img: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80", tall: false },
              { img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80", tall: false },
              { img: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=400&q=80", tall: false },
            ].map((item, i) => (
              <a
                key={i}
                href="https://www.instagram.com/rooto_in/"
                target="_blank"
                rel="noopener noreferrer"
                className={`img-cover rounded-xl overflow-hidden group ${item.tall ? 'row-span-2' : ''}`}
                style={{ height: item.tall ? '320px' : '150px' }}
              >
                <img src={item.img} alt={`Rooto.in post ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/rooto_in/"
              target="_blank"
              rel="noopener noreferrer"
              className="sans inline-flex items-center gap-3 ig-gradient text-white px-10 py-4 font-medium text-sm tracking-wide hover:opacity-90 transition-opacity rounded-full shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @rooto_in on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1528825871115-3581a5387919?w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 to-green-800/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="sans text-green-300 tracking-[0.3em] uppercase text-xs font-medium mb-6">Start the Conversation</p>
          <h2 className="display text-5xl lg:text-7xl font-light text-white leading-tight mb-6">
            We're just a<br /><em className="text-green-300">message away.</em>
          </h2>
          <p className="sans text-green-200/80 text-lg font-light mb-10 max-w-lg mx-auto">
            Whether it's feedback, a question, or a bulk order — we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.instagram.com/rooto_in/"
              target="_blank"
              rel="noopener noreferrer"
              className="sans ig-gradient text-white px-10 py-4 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              📸 Message on Instagram
            </a>
            <Link
              href="/"
              className="sans border border-white/30 text-white hover:border-white hover:bg-white/10 px-10 py-4 text-sm font-medium tracking-wide transition-all duration-300"
            >
              🍎 Shop Fresh Fruits
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}