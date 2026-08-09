import type { Metadata, Viewport } from "next";
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
import { GlobalHorizontalScrollProvider } from "@/components/shared/GlobalHorizontalScrollProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

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
        "www.everythinghub.info",
        "EverythingHub Dijital Araçlar"
      ],
      "description": "Ultra hızlı, ücretsiz, üyeliksiz ve %100 gizli dijital araçlar stüdyosu.",
      "inLanguage": ["tr-TR", "en-US"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.everythinghub.com.tr/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
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
      "@type": "SiteNavigationElement",
      "@id": "https://www.everythinghub.com.tr/#navigation",
      "name": [
        "YouTube Playlist Analizörü",
        "Spotify Playlist Analizörü",
        "QR Kod Stüdyosu Pro",
        "Görsel Sıkıştırıcı & WebP",
        "Canlı Döviz & Kripto Dönüştürücü",
        "Canlı Hava Durumu & Radar",
        "JSON Formatter & Validator",
        "JWT Debugger Studio"
      ],
      "url": [
        "https://www.everythinghub.com.tr/tools/yt-playlist-length",
        "https://www.everythinghub.com.tr/tools/spotify-playlist-analyzer",
        "https://www.everythinghub.com.tr/tools/qr-code-studio",
        "https://www.everythinghub.com.tr/tools/image-compressor",
        "https://www.everythinghub.com.tr/tools/currency-exchange-converter",
        "https://www.everythinghub.com.tr/tools/weather-air-quality",
        "https://www.everythinghub.com.tr/tools/json-formatter",
        "https://www.everythinghub.com.tr/tools/jwt-debugger"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.everythinghub.com.tr/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "EverythingHub nedir ve ne amaçla kullanılır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EverythingHub; geliştiriciler, içerik üreticileri, tasarımcılar ve günlük kullanıcılar için tasarlanmış 38+ ultra hızlı, üyeliksiz ve %100 gizli dijital araç içeren bir online araçlar stüdyosudur."
          }
        },
        {
          "@type": "Question",
          "name": "EverythingHub araçları ücretsiz mi ve kayıt gerektiriyor mu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Evet, EverythingHub üzerindeki tüm araçlar %100 ücretsizdir. Kayıt, üyelik, kredi kartı veya API anahtarı gerektirmez."
          }
        },
        {
          "@type": "Question",
          "name": "Verilerim sunucularda saklanıyor mu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hayır. EverythingHub 'Sıfır Veri Saklama (Zero Data Retention)' ilkesiyle çalışır. Tüm işlemler doğrudan tarayıcınızda veya belpekte işlenir, sunuculara hiçbir hassas veri kaydedilmez."
          }
        }
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

          {/* Global Horizontal Scroll Lock & Wheel Handler */}
          <GlobalHorizontalScrollProvider />
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
