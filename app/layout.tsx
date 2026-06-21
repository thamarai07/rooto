// app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import CelebrationPopup from '@/components/ui/CelebrationPopup'
import { AuthProvider } from '@/hooks/useAuth'
import AuthInitializer from '@/components/auth/AuthInitializer'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import Script from 'next/script'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const BASE_URL = 'https://rooto.in'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Rooto - Fresh Groceries Delivered',
    template: '%s | Rooto',
  },
  description:
    'Order fresh fruits, vegetables, and groceries online at Rooto. Fast delivery to your doorstep.',
  icons: { icon: '/favicon.png' },
  keywords: [
    'fresh groceries',
    'fruits delivery',
    'vegetables online',
    'online grocery',
    'rooto',
    'grocery delivery India',
    'fresh food delivery',
    'buy groceries online',
  ],
  authors: [{ name: 'Rooto', url: BASE_URL }],
  creator: 'Rooto',
  publisher: 'Rooto',
  // Canonical URL
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'Rooto — Fresh Groceries Delivered',
    description:
      'Order fresh fruits, vegetables, and groceries online at Rooto. Fast delivery to your doorstep.',
    url: BASE_URL,
    siteName: 'Rooto',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: 'Rooto — Fresh Groceries Delivered',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rooto — Fresh Groceries Delivered',
    description:
      'Order fresh fruits, vegetables, and groceries online at Rooto.',
    images: [`${BASE_URL}/opengraph-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '0MTKWg3l-9yNHU8OVAwuWR4F3ZPsNaBSMnWtlyyx_e0',
  },
}

// JSON-LD Structured Data — tells Google exactly what your site is
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rooto',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  description:
    'Order fresh fruits, vegetables, and groceries online at Rooto. Fast delivery to your doorstep.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi', 'Tamil'],
  },
  sameAs: [
    // Add your social media URLs here:
    // 'https://www.instagram.com/rooto_in',
    // 'https://twitter.com/rooto_in',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Rooto',
  url: BASE_URL,
  description: 'Fresh Groceries Delivered to your doorstep',
  // Enables Google Sitelinks Searchbox in search results!
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'GroceryStore',
  name: 'Rooto',
  url: BASE_URL,
  image: `${BASE_URL}/opengraph-image.png`,
  description: 'Fresh groceries delivered fast to your doorstep.',
  priceRange: '₹',
  servesCuisine: 'Grocery',
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Grocery Products',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Fresh Fruits' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Fresh Vegetables' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Dairy & Eggs' } },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Warm up the connection to the Hostinger API origin during HTML parse,
            so the browser's cart/wishlist fetches (and any client fallback) don't
            pay the cold DNS+TCP+TLS (~1.5s) penalty after hydration. */}
        <link
          rel="preconnect"
          href="https://seashell-skunk-617240.hostingersite.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://seashell-skunk-617240.hostingersite.com"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* JSON-LD Structured Data — injected in <head> for Google */}
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          strategy="beforeInteractive"
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          strategy="beforeInteractive"
        />
        <Script
          id="schema-local-business"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <AuthInitializer />
          <AnnouncementBanner />
          {children}
          <Analytics />
          <CelebrationPopup />
          <div id="recaptcha-container" style={{ display: 'none' }} />
        </AuthProvider>
      </body>
    </html>
  )
}
