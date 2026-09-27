/**
 * AegisFlasher Universal Resilient Binary Downloader
 * 4-Tier Strategy to completely eliminate 'Failed to fetch' CORS errors
 * With 15-second AbortController timeout per tier for reliable UX
 */

const FETCH_TIMEOUT_MS = 15000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function downloadBinaryWithFallback(url: string): Promise<Uint8Array> {
  // Normalize GitHub blob URLs to raw
  let targetUrl = url;
  if (targetUrl.includes('github.com') && targetUrl.includes('/blob/')) {
    targetUrl = targetUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  // Tier 1: Direct Fetch
  try {
    const directResp = await fetchWithTimeout(targetUrl);
    if (directResp.ok) {
      const ab = await directResp.arrayBuffer();
      if (ab.byteLength > 0) return new Uint8Array(ab);
    }
  } catch {
    // Direct fetch failed (CORS / timeout), fall through to server proxy
  }

  // Tier 2: Internal AegisFlasher Server Proxy Route (Highest Reliability)
  try {
    const proxyApiUrl = `/api/flasher/proxy?url=${encodeURIComponent(targetUrl)}`;
    const proxyResp = await fetchWithTimeout(proxyApiUrl);
    if (proxyResp.ok) {
      const ab = await proxyResp.arrayBuffer();
      if (ab.byteLength > 0) return new Uint8Array(ab);
    }
  } catch {
    // Server proxy failed, try fallback public CORS proxies
  }

  // Tier 3: External CorsProxy.io
  try {
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const corsResp = await fetchWithTimeout(corsProxyUrl);
    if (corsResp.ok) {
      const ab = await corsResp.arrayBuffer();
      if (ab.byteLength > 0) return new Uint8Array(ab);
    }
  } catch {
    // Fall through to Tier 4
  }

  // Tier 4: External AllOrigins Raw Proxy
  try {
    const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const aoResp = await fetchWithTimeout(allOriginsUrl);
    if (aoResp.ok) {
      const ab = await aoResp.arrayBuffer();
      if (ab.byteLength > 0) return new Uint8Array(ab);
    }
  } catch {
    // All tiers exhausted
  }

  throw new Error(
    `Dosya indirilemedi: ${targetUrl}. Sunucu ve tüm proxy bağlantıları başarısız oldu (15s timeout).`
  );
}
