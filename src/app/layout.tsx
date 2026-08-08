import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { DottedBackground } from "@/components/creative/DottedBackground";
import { UserCursor } from "@/components/creative/UserCursor";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://everythinghub.vercel.app"),
  title: {
    default: "everythinghub — Dijital Araçların Merkezi",
    template: "%s — everythinghub",
  },
  description:
    "YouTube playlist analizi, geliştirici yardımcıları, görsel ve tasarım araçları. Sıfır hesap gereksinimi, tamamen ücretsiz ve açık kaynak.",
  keywords: [
    "youtube playlist analyzer",
    "youtube playlist süresi",
    "dijital araçlar",
    "online tools",
    "everythinghub",
    "geliştirici araçları",
    "free online tools",
    "aegissoft",
  ],
  authors: [{ name: "aegisSoft", url: "https://www.aegissoft.com.tr/" }],
  creator: "MrSpy00",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://everythinghub.vercel.app",
    siteName: "everythinghub",
    title: "everythinghub — Dijital Araçların Merkezi",
    description:
      "YouTube playlist analizi, geliştirici yardımcıları, görsel ve tasarım araçları. Ücretsiz ve modern.",
  },
  twitter: {
    card: "summary_large_image",
    title: "everythinghub — Dijital Araçların Merkezi",
    description: "Her şeyin tek bir merkezi. Ücretsiz, login gerektirmez.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-[#fafafa] min-h-screen selection:bg-indigo-500/30 selection:text-white`}
      >
        {/* Creative WebGL Ambient Background */}
        <DottedBackground />

        {/* Studio User Follower Cursor */}
        <UserCursor name="EverythingHub" color="#8b5cf6" size={26} />

        {/* Main Application Container */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

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
