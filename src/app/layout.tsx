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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://everythinghub.vercel.app"),
  title: {
    default: "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu",
    template: "%s — EverythingHub",
  },
  description:
    "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
  keywords: [
    "EverythingHub",
    "dijital araçlar stüdyosu",
    "youtube playlist analyzer",
    "youtube playlist süresi hesaplama",
    "online developer tools",
    "görsel sıkıştırma",
    "görsel format dönüştürücü",
    "json formatter",
    "aegissoft",
  ],
  authors: [{ name: "aegisSoft", url: "https://www.aegissoft.com.tr/" }],
  creator: "MrSpy00",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://everythinghub.vercel.app",
    siteName: "EverythingHub",
    title: "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu",
    description:
      "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "EverythingHub Dijital Araçlar Stüdyosu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu",
    description:
      "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className="dark">
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
