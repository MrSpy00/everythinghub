import type { Metadata } from "next";
import { CryptoHashStudioClient } from "./CryptoHashStudioClient";

export const metadata: Metadata = {
  title: "Kriptografik Hash, HMAC & UUID/NanoID Laboratuvarı — Web Crypto Studio",
  description:
    "SHA-256, SHA-512, MD5, HMAC ve UUID v4/v7/NanoID üretimini %100 tarayıcı tarafında Web Crypto API ile anında gerçekleştirin.",
  keywords: [
    "sha256 hesaplayıcı",
    "sha512 hash online",
    "md5 hash generator",
    "uuid v4 üretici",
    "uuid v7 generator",
    "nanoid generator",
    "hmac generator",
    "dosya hash checksum",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/crypto-hash-studio",
  },
  openGraph: {
    title: "Kriptografik Hash & UUID Laboratuvarı — EverythingHub",
    description: "Büyük dosyaları yüklemeden yerel hash hesaplayın, UUID v4/v7 ve NanoID üretin.",
    url: "https://www.everythinghub.com.tr/tools/crypto-hash-studio",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kriptografik Hash & UUID Laboratuvarı — EverythingHub",
    description: "Büyük dosyaları yüklemeden yerel hash hesaplayın, UUID v4/v7 ve NanoID üretin.",
  },
};

export default function CryptoHashStudioPage() {
  return <CryptoHashStudioClient />;
}
