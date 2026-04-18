import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import CelebrationPopup from '@/components/ui/CelebrationPopup'
import Script from 'next/script'
import { AuthProvider } from '@/hooks/useAuth'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Rooto — Fresh Groceries Delivered',
  description: 'Order fresh fruits, vegetables, and groceries online at Rooto. Fast delivery to your doorstep.',
  icons: {
    icon: '/favicon.png',
  },
  keywords: ['fresh groceries', 'fruits', 'vegetables', 'online grocery', 'rooto', 'grocery delivery'],
  authors: [{ name: 'Rooto' }],
  metadataBase: new URL('https://rooto.in'),
  openGraph: {
    title: 'Rooto — Fresh Groceries Delivered',
    description: 'Order fresh fruits, vegetables, and groceries online at Rooto.',
    url: 'https://rooto.in',
    siteName: 'Rooto',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rooto — Fresh Groceries Delivered',
    description: 'Order fresh fruits, vegetables, and groceries online at Rooto.',
  },
  robots: {
    index: true,
    follow: true,
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
       
      </head>

      <body className="font-sans antialiased" suppressHydrationWarning>
      <AuthProvider>        {/* ← wrap here */}
          {children}
          <Analytics />
          <CelebrationPopup />
          <div id="recaptcha-container" style={{ display: 'none' }}></div>
        </AuthProvider>
      </body>
    </html>
  )
}
