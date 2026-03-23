"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Banner from "@/components/banner";

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#f9f6f0] font-['Cormorant_Garamond',serif]">
      <Header />
        <Banner />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .hero-text { font-family: 'Cormorant Garamond', serif; }
        .body-text { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideRight {
          from { width: 0; }
          to { width: 100%; }
        }

        .fade-up { animation: fadeUp 0.9s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.9s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.9s ease 0.25s both; }
        .fade-up-3 { animation: fadeUp 0.9s ease 0.4s both; }
        .fade-up-4 { animation: fadeUp 0.9s ease 0.55s both; }
        .fade-in { animation: fadeIn 1.2s ease forwards; }

        .leaf-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q45 20 30 55 Q15 20 30 5Z' fill='%2322c55e' fill-opacity='0.04'/%3E%3C/svg%3E");
        }

        .card-hover {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.12);
        }

        .img-overlay {
          position: relative;
          overflow: hidden;
        }
        .img-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(15,30,10,0.6));
        }

        .green-line::after {
          content: '';
          display: block;
          width: 60px;
          height: 3px;
          background: #16a34a;
          margin-top: 12px;
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1600&q=80')`,
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f0a]/85 via-[#0a1f0a]/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="max-w-2xl">
            <p className="fade-up-1 body-text text-green-400 tracking-[0.3em] uppercase text-sm mb-6 font-medium">
              About Rooto.in
            </p>
            <h1 className="fade-up-2 hero-text text-white font-light leading-none mb-8" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>
              Back to<br />
              <em className="text-green-400">Your Roots.</em>
            </h1>
            <p className="fade-up-3 body-text text-gray-300 text-lg leading-relaxed max-w-lg font-light">
              Health is not a luxury — it's a lifestyle everyone deserves. We are on a mission to bring people back to where real health begins.
            </p>
            <div className="fade-up-4 mt-10 flex gap-4">
              <Link href="/" className="body-text bg-green-600 hover:bg-green-500 text-white px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-green-900/40">
                Shop Fresh Fruits
              </Link>
              <a href="#mission" className="body-text border border-white/40 text-white hover:border-white px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300">
                Our Mission ↓
              </a>
            </div>
          </div>
        </div>

        {/* Decorative right panel */}
        <div className="absolute right-0 top-0 h-full w-1/3 hidden lg:flex flex-col justify-end p-12 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 fade-in">
            <p className="hero-text text-white text-4xl font-light">100%</p>
            <p className="body-text text-gray-300 text-sm mt-1">Farm Fresh Quality</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 fade-in">
            <p className="hero-text text-white text-4xl font-light">Daily</p>
            <p className="body-text text-gray-300 text-sm mt-1">Fresh Doorstep Delivery</p>
          </div>
        </div>
      </section>

      {/* ─── WHO WE ARE ─────────────────────────────────────── */}
      <section id="mission" className="py-32 leaf-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="body-text text-green-600 tracking-[0.25em] uppercase text-xs font-medium mb-4">Who We Are</p>
              <h2 className="hero-text text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-8 green-line">
                We deliver <em>health</em>,<br/>not just fruits.
              </h2>
              <div className="body-text text-gray-600 space-y-5 text-base leading-relaxed font-light">
                <p>
                  At Rooto.in, we carefully source mineral-rich fruits and deliver them straight to your doorstep, so you and your family can enjoy a healthier, more energetic life — every single day.
                </p>
                <p>
                  Our approach is inspired by globally trusted health organizations like <span className="text-green-700 font-medium">WHO</span>, <span className="text-green-700 font-medium">Harvard Health</span>, and <span className="text-green-700 font-medium">Mayo Clinic</span>, which emphasize the importance of natural nutrition and daily fruit consumption.
                </p>
                <p>
                  We are not just selling fruits. <strong className="text-gray-800 font-semibold">We are building a health movement.</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="img-overlay rounded-2xl overflow-hidden h-72 card-hover">
                <img
                  src="https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80"
                  alt="Fresh fruits"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="img-overlay rounded-2xl overflow-hidden h-72 mt-12 card-hover">
                <img
                  src="https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80"
                  alt="Healthy lifestyle"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY FRUITS MATTER ──────────────────────────────── */}
      <section className="py-28 bg-[#0f2010] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="body-text text-green-400 tracking-[0.25em] uppercase text-xs font-medium mb-4">Science-Backed</p>
            <h2 className="hero-text text-5xl lg:text-6xl font-light leading-tight">
              Why Fruits <em className="text-green-400">Matter</em>?
            </h2>
            <p className="body-text text-gray-400 mt-4 max-w-xl mx-auto font-light">
              Fruits are not just food — they are natural medicine. Research from WHO and NIH confirms their power.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10">
            {[
              { icon: "🧬", title: "Essential Vitamins", desc: "Packed with vitamins & minerals your body needs daily" },
              { icon: "🛡️", title: "Boost Immunity", desc: "Strengthen your natural defenses against illness" },
              { icon: "🌿", title: "Better Digestion", desc: "Improve gut health & digestive wellness naturally" },
              { icon: "⚡", title: "Energy Levels", desc: "Increase your natural energy without supplements" },
              { icon: "✨", title: "Skin & Glow", desc: "Enhance skin radiance & overall outer wellness" },
              { icon: "⚖️", title: "Weight Support", desc: "Support healthy weight loss & fat reduction goals" },
            ].map((item, i) => (
              <div key={i} className="bg-[#0f2010] p-8 hover:bg-[#1a3a1a] transition-colors duration-300 group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="hero-text text-white text-xl font-medium mb-2 group-hover:text-green-400 transition-colors">{item.title}</h3>
                <p className="body-text text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IS IT FOR ──────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="body-text text-green-600 tracking-[0.25em] uppercase text-xs font-medium mb-4">For Everyone</p>
            <h2 className="hero-text text-5xl lg:text-6xl font-light text-gray-900 leading-tight">
              Who Is It <em>For</em>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "👶",
                title: "For Children",
                img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
                points: ["Proper growth & brain development", "Strengthens immunity naturally", "Healthy alternative to junk food"],
              },
              {
                emoji: "👨‍👩‍👧‍👦",
                title: "For Families",
                img: "https://images.unsplash.com/photo-1484665754804-74b091211472?w=400&q=80",
                points: ["Keeps the whole family stronger", "Builds strong immunity system", "Encourages healthy eating habits"],
              },
              {
                emoji: "🎒",
                title: "For Students",
                img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80",
                points: ["Improves focus & concentration", "Boosts natural energy levels", "Supports academic performance"],
              },
              {
                emoji: "💪",
                title: "For Fitness Lovers",
                img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
                points: ["Natural pre & post workout energy", "Supports muscle recovery", "Fat loss & lean body goals"],
              },
              {
                emoji: "👴",
                title: "For Elderly",
                img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
                points: ["Easy to digest & nutrient-rich", "Supports heart health", "Improves overall longevity"],
              },
              {
                emoji: "🌍",
                title: "For Everyone",
                img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
                points: ["Daily nutrition for all ages", "Natural medicine from nature", "Start your health journey today"],
              },
            ].map((card, i) => (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
                <div className="h-48 overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{card.emoji}</span>
                    <h3 className="hero-text text-xl font-semibold text-gray-900">{card.title}</h3>
                  </div>
                  <ul className="body-text space-y-2">
                    {card.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-600 text-sm font-light">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT MAKES US SPECIAL ──────────────────────────── */}
      <section className="py-28 bg-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80"
                  alt="Farm fresh fruits"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-5 rounded-2xl">
                  <p className="hero-text text-gray-900 text-xl font-semibold">"From farm to your home — fresh, fast, and full of life."</p>
                  <p className="body-text text-green-600 text-sm mt-1 font-medium">— Team Rooto.in</p>
                </div>
              </div>
            </div>

            <div>
              <p className="body-text text-green-600 tracking-[0.25em] uppercase text-xs font-medium mb-4">Why Choose Us</p>
              <h2 className="hero-text text-5xl font-light text-gray-900 leading-tight mb-10 green-line">
                What Makes<br/><em>Rooto.in</em> Special?
              </h2>
              <div className="space-y-6">
                {[
                  { icon: "🥭", title: "Farm-Fresh Quality", desc: "We carefully select fruits that are fresh, clean, and full of nutrients." },
                  { icon: "🚚", title: "Fast & Reliable Delivery", desc: "From farm to your home — quick and hygienic delivery every time." },
                  { icon: "💯", title: "No Compromise on Health", desc: "Quality over quantity, always. We never settle for less." },
                  { icon: "❤️", title: "Built with Care", desc: "We treat every order like it's for our own family." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-12 h-12 bg-green-100 group-hover:bg-green-600 rounded-xl flex items-center justify-center text-xl transition-colors duration-300 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="hero-text text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="body-text text-gray-500 text-sm font-light mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISION ─────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1557844352-761f2565b576?w=1600&q=80')` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="body-text text-green-600 tracking-[0.25em] uppercase text-xs font-medium mb-4">Looking Ahead</p>
          <h2 className="hero-text text-5xl lg:text-7xl font-light text-gray-900 leading-tight mb-10">
            Our <em className="text-green-600">Vision</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { num: "01", text: "Every home has healthy food habits and fresh produce daily" },
              { num: "02", text: "Children grow up strong, active, and naturally nourished" },
              { num: "03", text: "Health becomes a daily priority, not an emergency response" },
            ].map((v, i) => (
              <div key={i} className="text-left border-t-2 border-green-600 pt-6">
                <p className="hero-text text-5xl font-light text-green-200">{v.num}</p>
                <p className="body-text text-gray-600 text-base font-light mt-3 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="py-28 bg-[#0f2010]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="body-text text-green-400 tracking-[0.25em] uppercase text-xs font-medium mb-6">Join The Movement</p>
          <h2 className="hero-text text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
            Eat Fresh.<br/><em className="text-green-400">Live Better. Be Stronger.</em>
          </h2>
          <p className="body-text text-gray-400 text-lg font-light mb-10 max-w-xl mx-auto">
            Start your journey today. Better health, better habits, better lives — delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="body-text bg-green-600 hover:bg-green-500 text-white px-10 py-4 text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-green-900/50">
              🍎 Shop Fresh Fruits
            </Link>
            <a href="https://www.instagram.com/rooto_in/" target="_blank" rel="noopener noreferrer" className="body-text border border-white/30 text-white hover:border-green-400 hover:text-green-400 px-10 py-4 text-sm font-medium tracking-wide transition-all duration-300">
              Follow on Instagram →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}