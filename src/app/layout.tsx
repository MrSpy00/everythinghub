import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { DottedBackground } from "@/components/creative/DottedBackground";
import { UserCursor } from "@/components/creative/UserCursor";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.everythinghub.com.tr"),
  title: {
    default: "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu",
    template: "%s — EverythingHub",
  },
  description:
    "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır. Spotify analizör, YouTube playlist hesaplama, görsel sıkıştırma, JSON formatlama ve geliştirici araçları stüdyosu.",
  keywords: [
    // Primary Domain & Brands
    "EverythingHub",
    "everythinghub",
    "everythinghub.com.tr",
    "www.everythinghub.com.tr",
    "everythinghub.info",
    "www.everythinghub.info",
    "aegisSoft",
    "aegissoft",
    "MrSpy00",
    "mrspy00",
    "aegissoft.com.tr",
    // Studio & General Category Keywords
    "dijital araçlar stüdyosu",
    "ücretsiz online araçlar",
    "online developer tools",
    "digital utility studio",
    "zero data retention tools",
    "browser based web tools",
    // Tool Specific Keywords (Turkish)
    "youtube playlist analyzer",
    "youtube playlist süresi hesaplama",
    "youtube playlist uzunluğu",
    "youtube thumbnail indirici",
    "youtube zaman damgası üretici",
    "spotify playlist analizör",
    "spotify bot tespiti",
    "spotify profil analiz",
    "görsel sıkıştırma",
    "webp dönüştürücü",
    "görsel format dönüştürücü",
    "json formatlayıcı",
    "base64 kodlayıcı",
    "regex test aracı",
    "kelime sayacı",
    "metin kasa dönüştürücü",
    "birim dönüştürücü",
    "yüzde hesaplama",
    "css degrade üretici",
    "renk paleti çıkarıcı",
    // Tool Specific Keywords (English)
    "youtube playlist duration calculator",
    "spotify bot detector",
    "spotify playlist analyzer online",
    "image compressor online",
    "json validator formatter",
    "base64 encoder decoder",
    "interactive regex tester",
    "word character counter",
    "case converter online",
    "unit converter tool",
    "percentage calculator online",
  ],
  authors: [
    { name: "aegisSoft", url: "https://www.aegissoft.com.tr/" },
    { name: "MrSpy00", url: "https://github.com/MrSpy00" },
  ],
  creator: "MrSpy00 (aegisSoft)",
  publisher: "aegisSoft",
  alternates: {
    canonical: "https://www.everythinghub.com.tr",
    languages: {
      "tr-TR": "https://www.everythinghub.com.tr",
      "en-US": "https://www.everythinghub.com.tr",
    },
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    url: "https://www.everythinghub.com.tr",
    siteName: "EverythingHub — Dijital Araçlar Stüdyosu",
    title: "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu",
    description:
      "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "EverythingHub Dijital Araçlar Stüdyosu — aegisSoft",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu",
    description:
      "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    creator: "@MrSpy00",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.everythinghub.com.tr/#website",
      "url": "https://www.everythinghub.com.tr",
      "name": "EverythingHub",
      "alternateName": [
        "Everything Hub",
        "EverythingHub Studio",
        "everythinghub.com.tr",
        "www.everythinghub.com.tr",
        "everythinghub.info",
        "www.everythinghub.info"
      ],
      "description": "Ultra hızlı, ücretsiz, üyeliksiz ve %100 gizli dijital araçlar stüdyosu.",
      "inLanguage": ["tr-TR", "en-US"],
      "sameAs": [
        "https://everythinghub.com.tr",
        "https://www.everythinghub.info",
        "https://everythinghub.info",
        "https://github.com/MrSpy00/everythinghub",
        "https://www.aegissoft.com.tr/"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.everythinghub.com.tr/#organization",
      "name": "aegisSoft",
      "url": "https://www.aegissoft.com.tr/",
      "logo": "https://www.everythinghub.com.tr/icon.svg",
      "founder": {
        "@type": "Person",
        "name": "MrSpy00",
        "url": "https://github.com/MrSpy00"
      },
      "sameAs": [
        "https://github.com/MrSpy00",
        "https://www.aegissoft.com.tr/"
      ]
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.everythinghub.com.tr/#webapp",
      "name": "EverythingHub Dijital Araçlar Stüdyosu",
      "url": "https://www.everythinghub.com.tr",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "author": {
        "@type": "Organization",
        "name": "aegisSoft",
        "url": "https://www.aegissoft.com.tr/"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-[#fafafa] min-h-screen selection:bg-indigo-500/30 selection:text-white font-sans`}
      >
        {/* Creative WebGL Ambient Background */}
        <DottedBackground />

        {/* Studio User Follower Cursor */}
        <UserCursor name="EverythingHub" color="#8b5cf6" size={26} />

        <LanguageProvider>
          {/* Main Application Container */}
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          {/* Smooth Intelligent Scroll to Top */}
          <ScrollToTop />
        </LanguageProvider>

        {/* Global Notifications */}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--hub-surface)",
              border: "1px solid var(--hub-border)",
              color: "var(--hub-text)",
            },
          }}
        />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
