import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("true-client-ip") ||
    "127.0.0.1";

  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    "TR";

  const city =
    request.headers.get("cf-ipcity") ||
    request.headers.get("x-vercel-ip-city") ||
    "İstanbul";

  const colo = request.headers.get("cf-ray")?.split("-")[1] || "IST";

  return NextResponse.json({
    ip: clientIp,
    country,
    city,
    colo,
    userAgent: request.headers.get("user-agent") || "",
    timestamp: new Date().toISOString(),
  });
}
