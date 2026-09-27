import { NextRequest, NextResponse } from "next/server";

/**
 * aegisFlasher Secure Binary Proxy Route
 * SSRF-safe server-side CORS bypass for official firmware sources only.
 * Allowlist enforced — no arbitrary URL proxying.
 */

const ALLOWED_DOMAINS = [
  "raw.githubusercontent.com",
  "github.com",
  "objects.githubusercontent.com",
  "github-releases.githubusercontent.com",
  "releases.arduino.cc",
  "downloads.arduino.cc",
  "firmware.arduino.cc",
  "cdn.arduino.cc",
  "arduino.cc",
  "dl.espressif.com",
  "static.espressif.com",
  "espressif.com",
  "api.github.com",
  "downloads.tasmota.com",
  "github.io",
  "kno.wled.ge",
  "install.wled.me",
  "meshtastic.org",
  "firmware.meshtastic.org",
  "tasmota.github.io",
  "ota.tasmota.com",
];

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /localhost/i,
  /\.local$/i,
];

const PROXY_TIMEOUT_MS = 30000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing 'url' query parameter.", { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return new NextResponse("Invalid URL format.", { status: 400 });
  }

  // Protocol check
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return new NextResponse("Invalid protocol. Only http/https allowed.", { status: 400 });
  }

  // SSRF: block private/loopback addresses
  const hostname = parsedUrl.hostname;
  if (PRIVATE_IP_PATTERNS.some((p) => p.test(hostname))) {
    return new NextResponse("Private/loopback addresses are not allowed.", { status: 403 });
  }

  // Domain allowlist check
  const isAllowed = ALLOWED_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith("." + d)
  );
  if (!isAllowed) {
    return new NextResponse(
      "Domain not in allowlist. Only official firmware repositories are permitted.",
      { status: 403 }
    );
  }

  // Content-length guard: reject obviously oversized requests (>64MB)
  const MAX_SIZE_BYTES = 64 * 1024 * 1024;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "aegisFlasher/2.0 (EverythingHub Firmware Proxy; +https://www.everythinghub.com.tr)",
        Accept: "application/octet-stream, */*",
      },
      redirect: "follow",
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      return new NextResponse(
        `Upstream server returned HTTP ${response.status}: ${response.statusText}`,
        { status: response.status }
      );
    }

    // Content-Length guard
    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (!isNaN(contentLength) && contentLength > MAX_SIZE_BYTES) {
        return new NextResponse("Firmware file exceeds 64MB limit.", { status: 413 });
      }
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
      return new NextResponse("Firmware file exceeds 64MB limit.", { status: 413 });
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "private, max-age=3600",
        "X-Proxied-By": "aegisFlasher",
        "X-Source-URL": parsedUrl.hostname,
      },
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return new NextResponse(
        "Upstream request timed out after 30 seconds.",
        { status: 504 }
      );
    }
    return new NextResponse(
      `Failed to fetch upstream binary: ${err?.message || "Network error"}`,
      { status: 502 }
    );
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
