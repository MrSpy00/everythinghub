import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing 'url' query parameter.", { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new NextResponse("Invalid protocol.", { status: 400 });
    }

    const ALLOWED_DOMAINS = [
      "raw.githubusercontent.com",
      "github.com",
      "releases.arduino.cc",
      "downloads.arduino.cc",
      "github-releases.githubusercontent.com",
      "objects.githubusercontent.com",
      "dl.espressif.com",
      "api.github.com",
      "firmware.arduino.cc",
      "static.espressif.com",
      "espressif.com",
      "arduino.cc",
      "cdn.arduino.cc",
      "downloads.tasmota.com",
      "github.io",
      "kno.wled.ge",
      "install.wled.me",
    ];
    if (!ALLOWED_DOMAINS.some(d => parsedUrl.hostname === d || parsedUrl.hostname.endsWith('.' + d))) {
      return new NextResponse("Domain not allowed. Only official firmware sources are permitted.", { status: 403 });
    }

    const hostname = parsedUrl.hostname;
    const privatePatterns = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^169\.254\./, /^\[?::1\]?$/, /localhost/i];
    if (privatePatterns.some(p => p.test(hostname))) {
      return new NextResponse("Private/loopback addresses are not allowed.", { status: 403 });
    }

    // Server-side fetch bypassing browser CORS restrictions
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return new NextResponse(`Upstream server returned HTTP ${response.status}: ${response.statusText}`, {
        status: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Flasher Proxy Error:", err);
    return new NextResponse(`Failed to fetch upstream binary: ${err.message || err}`, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
