// app/opengraph-image.tsx
// This auto-generates /opengraph-image.png — used for Google + social sharing
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rooto — Fresh Groceries Delivered'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    padding: '60px',
                }}
            >
                {/* Logo / Brand Name */}
                <div
                    style={{
                        fontSize: 96,
                        fontWeight: 800,
                        color: 'white',
                        letterSpacing: '-2px',
                        marginBottom: '16px',
                    }}
                >
                    🥦 Rooto
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontSize: 40,
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 400,
                        textAlign: 'center',
                        maxWidth: '800px',
                    }}
                >
                    Fresh Groceries Delivered to Your Doorstep
                </div>

                {/* Sub text */}
                <div
                    style={{
                        marginTop: '32px',
                        fontSize: 28,
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        gap: '40px',
                    }}
                >
                    <span>🍅 Fresh Produce</span>
                    <span>🥛 Dairy</span>
                    <span>⚡ Fast Delivery</span>
                </div>

                {/* URL */}
                <div
                    style={{
                        marginTop: '48px',
                        fontSize: 24,
                        color: 'rgba(255,255,255,0.6)',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        paddingTop: '24px',
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    rooto.in
                </div>
            </div>
        ),
        { ...size }
    )
}