import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://everythinghub.com"),
  title: {
    default: "everythinghub — Her Şeyin Merkezi",
    template: "%s — everythinghub",
  },
  description:
    "YouTube araçları, görsel araçları, geliştirici araçları ve daha fazlası. Login gerektirmez, tamamen ücretsiz.",
  keywords: [
    "youtube playlist",
    "araçlar",
    "tools",
    "everythinghub",
    "ücretsiz araçlar",
    "online tools",
  ],
  authors: [{ name: "everythinghub" }],
  creator: "everythinghub",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://everythinghub.com",
    siteName: "everythinghub",
    title: "everythinghub — Her Şeyin Merkezi",
    description:
      "YouTube araçları, görsel araçları, geliştirici araçları ve daha fazlası.",
  },
  twitter: {
    card: "summary_large_image",
    title: "everythinghub",
    description: "Her şeyin bir merkezi. Ücretsiz, login gerektirmez.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuroraBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
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
      </body>
    </html>
  );
}
