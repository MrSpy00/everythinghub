import type { Metadata } from "next";
import { SQLToTypesClient } from "./SQLToTypesClient";

export const metadata: Metadata = {
  title: "SQL'den TypeScript, Zod, Prisma & Go Struct Dönüştürücü — Schema Studio",
  description:
    "SQL CREATE TABLE tablolarını anında TypeScript interface, Zod şeması, Prisma modeli, Go struct ve Python Pydantic kodlarına dönüştürün.",
  keywords: [
    "sql to typescript",
    "sql to zod",
    "sql to prisma",
    "sql to go struct",
    "sql to pydantic",
    "database schema converter",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/sql-to-types",
  },
  openGraph: {
    title: "SQL'den TypeScript, Zod & Prisma Dönüştürücü — EverythingHub",
    description: "Veritabanı tablolarını anında modern backend ve frontend tip modellerine dönüştürün.",
    url: "https://www.everythinghub.com.tr/tools/sql-to-types",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL'den TypeScript, Zod & Prisma Dönüştürücü — EverythingHub",
    description: "Veritabanı tablolarını anında modern backend ve frontend tip modellerine dönüştürün.",
  },
};

export default function SQLToTypesPage() {
  return <SQLToTypesClient />;
}
