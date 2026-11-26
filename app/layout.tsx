// app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import CelebrationPopup from '@/components/ui/CelebrationPopup'
import { AuthProvider } from '@/hooks/useAuth'
import AuthInitializer from '@/components/auth/AuthInitializer'
import StoreSettingsInitializer from '@/components/StoreSettingsInitializer'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import WhatsAppButton from '@/components/WhatsAppButton'
import JsonLd from '@/components/seo/JsonLd'
import Script from 'next/script'
import { AREAS } from '@/lib/areas'
import { SITE_URL } from '@/lib/config'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/pricing'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const BASE_URL = SITE_URL

// Single source of truth for the business's contact + service-area details.
// Reused by the metadata below and the JSON-LD schema further down.
export const ROOTO_BUSINESS = {
  name: 'Rooto',
  legalName: 'Rooto',
  url: BASE_URL,
  phone: '+91-96770-28737',
  email: 'talk@rooto.in',
  instagram: 'https://www.instagram.com/rooto_in/',
  // Service-area business (delivery only — no walk-in storefront), so the
  // schema lists the delivery areas from lib/areas.ts and deliberately has NO
  // street address or GPS point: publishing a made-up "shop location" would
  // misrepresent the business to Google.
  areaServed: [...AREAS.map((a) => a.name), 'Chennai'],
} as const

const DEFAULT_DESCRIPTION =
  `Order fresh, hand-picked fruits online from Rooto for home delivery across Tambaram, Medavakkam, Pallikaranai, Velachery and nearby South Chennai areas. ₹${SHIPPING_FEE} delivery, free above ₹${FREE_SHIPPING_THRESHOLD}.`

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Rooto — Fresh Fruit Delivery in South Chennai',
    template: '%s | Rooto',
  },
  description: DEFAULT_DESCRIPTION,
  icons: { icon: '/favicon.png' },
  authors: [{ name: 'Rooto', url: BASE_URL }],
  creator: 'Rooto',
  publisher: 'Rooto',
  // NOTE: no `alternates.canonical` here on purpose. A canonical set in the
  // root layout is inherited by every page that doesn't override it, which
  // told Google that pages like /festival/* were duplicates of the homepage.
  // Each indexable page declares its own self-canonical instead.
  openGraph: {
    title: 'Rooto — Fresh Fruit Delivery in South Chennai',
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    siteName: 'Rooto',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: 'Rooto — Fresh Fruit Delivery in South Chennai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rooto — Fresh Fruit Delivery in South Chennai',
    description: DEFAULT_DESCRIPTION,
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

// JSON-LD Structured Data — tells Google exactly what this site is.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ROOTO_BUSINESS.name,
  legalName: ROOTO_BUSINESS.legalName,
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  description: DEFAULT_DESCRIPTION,
  email: ROOTO_BUSINESS.email,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: ROOTO_BUSINESS.phone,
    email: ROOTO_BUSINESS.email,
    availableLanguage: ['English', 'Tamil'],
  },
  sameAs: [ROOTO_BUSINESS.instagram],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: ROOTO_BUSINESS.name,
  url: BASE_URL,
  description: DEFAULT_DESCRIPTION,
  // Enables the Google Sitelinks search box (points at the real listing page).
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// Delivery-only fruit business serving specific South-Chennai neighbourhoods.
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'GroceryStore',
  '@id': `${BASE_URL}/#business`,
  name: ROOTO_BUSINESS.name,
  url: BASE_URL,
  image: `${BASE_URL}/opengraph-image.png`,
  description: DEFAULT_DESCRIPTION,
  priceRange: '₹₹',
  telephone: ROOTO_BUSINESS.phone,
  email: ROOTO_BUSINESS.email,
  currenciesAccepted: 'INR',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
  areaServed: ROOTO_BUSINESS.areaServed.map((name) =>
    name === 'Chennai'
      ? { '@type': 'City', name: 'Chennai' }
      : { '@type': 'Place', name: `${name}, Chennai` },
  ),
  sameAs: [ROOTO_BUSINESS.instagram],
  paymentAccepted: 'Cash, UPI, Online payment',
  knowsAbout: ['Fresh fruits', 'Seasonal fruits', 'Fruit home delivery'],
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        {/* JSON-LD structured data — rendered as plain <script> tags so they are
            present in the server HTML immediately (next/script beforeInteractive
            serialises these into the RSC payload instead, which crawler tools
            and the Rich Results Test do not reliably pick up). */}
        <JsonLd data={[organizationSchema, websiteSchema, localBusinessSchema]} />
{/* Meta Pixel */}
  <Script id="meta-pixel" strategy="afterInteractive">
    {`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', '1065248729423336');
      fbq('track', 'PageView');
    `}
  </Script>
        <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>

        <AuthProvider>
          <AuthInitializer />
          <StoreSettingsInitializer />
          <AnnouncementBanner />
          {children}
          <Analytics />
          <CelebrationPopup />
          <WhatsAppButton />
          <div id="recaptcha-container" style={{ display: 'none' }} />
        </AuthProvider>
      </body>
    </html>
  )
}
