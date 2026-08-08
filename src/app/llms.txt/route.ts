import { NextResponse } from "next/server";
import { tools } from "@/lib/tools-registry";

export const runtime = "nodejs";

export async function GET() {
  const baseUrl = "https://www.everythinghub.com.tr";
  
  const markdown = `# EverythingHub — All-In-One Free Digital Tools Studio
> Privacy-first, zero-login, zero-auth digital tools studio running client-side on Web Crypto, Web Audio, HTML5 Canvas, and zero-auth public APIs.

## Official Canonical Domains
- Primary: ${baseUrl}
- Secondary: https://everythinghub.com.tr, https://www.everythinghub.info, https://everythinghub.info

## Tools Catalog (${tools.length} Tools)
${tools
  .map(
    (t) => `- [${t.title}](${baseUrl}/tools/${t.slug}): ${t.description} (Category: ${t.category})`
  )
  .join("\n")}

## Features & Architecture
- Next.js 16.3 Turbopack, React 19, Tailwind CSS v4.
- Zero data retention: No tracking cookies, no server-side telemetry.
- Designed & Engineered by aegisSoft & MrSpy00.
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
