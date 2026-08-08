import type { Metadata } from "next";
import { DNSLookupClient } from "./DNSLookupClient";

export const metadata: Metadata = {
  title: "DNS Kayıtları & DoH Sorgulayıcı — DNS over HTTPS Inspector",
  description:
    "Herhangi bir alan adının A, AAAA, MX, TXT, CNAME, NS ve SOA kayıtlarını Cloudflare & Google DoH altyapısıyla anında sorgulayın.",
  keywords: [
    "dns sorgulama",
    "dns records lookup",
    "mx kaydı sorgulama",
    "txt kaydı kontrol",
    "dns over https",
    "doh resolver",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/dns-lookup-tool",
  },
  openGraph: {
    title: "DNS Kayıtları & DoH Sorgulayıcı — EverythingHub",
    description: "A, AAAA, MX, TXT ve CNAME DNS kayıtlarını tarayıcınızdan anında sorgulayın.",
    url: "https://www.everythinghub.com.tr/tools/dns-lookup-tool",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DNS Kayıtları & DoH Sorgulayıcı — EverythingHub",
    description: "A, AAAA, MX, TXT ve CNAME DNS kayıtlarını tarayıcınızdan anında sorgulayın.",
  },
};

export default function DNSLookupPage() {
  return <DNSLookupClient />;
}
