"use client"

const announcements = [
    "🌿 Fresh from the farm — delivered to your door every day!",
    "🎉 Get 10% OFF on your first order — use code ROOTO10 at checkout!",
    "🚚 Free delivery on orders above ₹499 — shop now!",
    "🥦 100% organic & naturally grown produce — no chemicals, just freshness!",
    "🌾 Support local farmers — every purchase makes a difference!",
    "⏰ Order before 8 PM for next-day morning delivery!",
    "💚 Same-day delivery available in select areas — check yours today!",
]

export default function AnnouncementBanner() {
    // Duplicate the list so the scroll appears infinite
    const items = [...announcements, ...announcements]

    return (
        <div
            className="announcement-banner"
            style={{
                background: "linear-gradient(90deg, #16a34a 0%, #059669 50%, #16a34a 100%)",
                overflow: "hidden",
                whiteSpace: "nowrap",
                height: "36px",
                display: "flex",
                alignItems: "center",
            }}
        >
            {/* Marquee track */}
            <div className="marquee-track">
                {items.map((text, i) => (
                    <span key={i} className="marquee-item">
                        {text}
                    </span>
                ))}
            </div>

            {/* Inline keyframes + styles */}
            <style>{`
        .marquee-track {
          display: inline-flex;
          animation: marquee-scroll 40s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-item {
          display: inline-block;
          padding: 0 2.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: 0.01em;
          position: relative;
        }
        .marquee-item::after {
          content: "✦";
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.45);
          font-size: 0.55rem;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    )
}
