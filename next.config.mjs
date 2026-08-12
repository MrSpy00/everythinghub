/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "ogl",
      "fuse.js",
      "sonner",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-progress",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*(.+\\.(?:svg|jpg|png|webp|avif|ico|woff|woff2))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.spotify.com https://api.deezer.com https://itunes.apple.com https://www.youtube.com https://youtube.com https://*.ytimg.com https://*.googlevideo.com https://www.googleapis.com https://vercel.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://corsproxy.io https://api.allorigins.win https://api.frankfurter.app https://api.frankfurter.dev https://open.er-api.com https://api.coingecko.com https://api.binance.com https://cloudflare-dns.com https://dns.google https://1.1.1.1 https://api.ipify.org https://api64.ipify.org https://api.vatcomply.com https://ipapi.co https://ip-api.com https://openlibrary.org https://raw.githubusercontent.com https://api.open-meteo.com https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://api.dictionaryapi.dev https://api.datamuse.com https://opentdb.com https://api.sunrise-sunset.org https://api.github.com https://api.nasa.gov https://dog.ceo https://catfact.ninja https://jsonplaceholder.typicode.com https://reqres.in https://randomuser.me https://uselessfacts.jsph.pl https://universities.hipolabs.com https://restcountries.com https://mainfacts.com",
              "media-src 'self' blob: https://*.scdn.co https://*.spotifycdn.com https://*.dzcdn.net",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;
