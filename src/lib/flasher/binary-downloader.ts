/**
 * AegisFlasher Universal Resilient Binary Downloader
 * 4-Tier Strategy to completely eliminate 'Failed to fetch' CORS errors
 */

export async function downloadBinaryWithFallback(url: string): Promise<Uint8Array> {
  // Normalize GitHub blob URLs to raw
  let targetUrl = url;
  if (targetUrl.includes("github.com") && targetUrl.includes("/blob/")) {
    targetUrl = targetUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }

  // Tier 1: Direct Fetch
  try {
    const directResp = await fetch(targetUrl);
    if (directResp.ok) {
      const ab = await directResp.arrayBuffer();
      if (ab.byteLength > 0) {
        return new Uint8Array(ab);
      }
    }
  } catch (directErr) {
    // Direct fetch failed due to CORS or redirect, fall through to server proxy
  }

  // Tier 2: Internal AegisFlasher Server Proxy Route (Highest Reliability)
  try {
    const proxyApiUrl = `/api/flasher/proxy?url=${encodeURIComponent(targetUrl)}`;
    const proxyResp = await fetch(proxyApiUrl);
    if (proxyResp.ok) {
      const ab = await proxyResp.arrayBuffer();
      if (ab.byteLength > 0) {
        return new Uint8Array(ab);
      }
    }
  } catch (proxyErr) {
    // Server proxy failed, try fallback public CORS proxies
  }

  // Tier 3: External CorsProxy.io
  try {
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const corsResp = await fetch(corsProxyUrl);
    if (corsResp.ok) {
      const ab = await corsResp.arrayBuffer();
      if (ab.byteLength > 0) {
        return new Uint8Array(ab);
      }
    }
  } catch (corsErr) {
    // Fall through to Tier 4
  }

  // Tier 4: External AllOrigins Raw Proxy
  try {
    const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const aoResp = await fetch(allOriginsUrl);
    if (aoResp.ok) {
      const ab = await aoResp.arrayBuffer();
      if (ab.byteLength > 0) {
        return new Uint8Array(ab);
      }
    }
  } catch (aoErr) {
    // All tiers exhausted
  }

  throw new Error(`Dosya indirilemedi: ${targetUrl}. Sunucu ve tüm proxy bağlantıları başarısız oldu.`);
}
