import type { Metadata } from "next";
import { JWTDebuggerClient } from "./JWTDebuggerClient";

export const metadata: Metadata = {
  title: "İstemci Taraflı JWT Debugger & Token Çözücü — %100 Gizli & Güvenli",
  description:
    "JSON Web Token (JWT) başlık, payload ve imza verilerini %100 tarayıcı tarafında çözün. Canlı süre geri sayımı ve claim ayrıştırma.",
  keywords: [
    "jwt debugger",
    "jwt decoder",
    "json web token çözücü",
    "jwt inspector",
    "jwt token analyzer",
    "zero retention jwt",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/jwt-debugger",
  },
  openGraph: {
    title: "İstemci Taraflı JWT Debugger — EverythingHub",
    description: "JWT token'ları sunucuya göndermeden tarayıcıda %100 güvenle çözün ve inceleyin.",
    url: "https://www.everythinghub.com.tr/tools/jwt-debugger",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İstemci Taraflı JWT Debugger — EverythingHub",
    description: "JWT token'ları sunucuya göndermeden tarayıcıda %100 güvenle çözün ve inceleyin.",
  },
};

export default function JWTDebuggerPage() {
  return <JWTDebuggerClient />;
}
