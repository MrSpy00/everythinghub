import { NextRequest, NextResponse } from "next/server";

export interface GitHubRepoResponseItem {
  id: number;
  full_name: string;
  name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics?: string[];
  language?: string;
  updated_at: string;
  default_branch?: string;
}

export interface ClassifiedAsset {
  id: number;
  name: string;
  size: number;
  sizeFormatted: string;
  browser_download_url: string;
  download_count: number;
  content_type: string;
  role: string;
  suggestedOffsetHex: string;
  suggestedOffsetNum: number;
  chipTarget: string;
}

export interface CleanReleaseInfo {
  id: number;
  tag_name: string;
  name: string | null;
  published_at: string;
  body: string | null;
  prerelease: boolean;
  assets: ClassifiedAsset[];
}

// Built-in curated open-source microcontroller firmware database for instant fallback & search boost
const CURATED_REPOSITORIES: GitHubRepoResponseItem[] = [
  {
    id: 139151528,
    full_name: "Aircoookie/WLED",
    name: "WLED",
    owner: { login: "Aircoookie", avatar_url: "https://avatars.githubusercontent.com/u/22900687?v=4" },
    description: "Control WS2812B and many more types of digital RGB LEDs with an ESP8266 or ESP32 over WiFi!",
    stargazers_count: 18500,
    forks_count: 3600,
    html_url: "https://github.com/Aircoookie/WLED",
    topics: ["esp32", "esp8266", "led", "ws2812b", "fastled", "home-assistant", "neopixel", "iot"],
    language: "C++",
    updated_at: new Date().toISOString(),
  },
  {
    id: 80562699,
    full_name: "arendst/Tasmota",
    name: "Tasmota",
    owner: { login: "arendst", avatar_url: "https://avatars.githubusercontent.com/u/34340210?v=4" },
    description: "Alternative firmware for ESP8266 and ESP32 based devices with easy configuration using webUI, OTA, MQTT.",
    stargazers_count: 22800,
    forks_count: 5100,
    html_url: "https://github.com/arendst/Tasmota",
    topics: ["esp32", "esp8266", "home-automation", "mqtt", "iot", "smart-home", "tasmota"],
    language: "C",
    updated_at: new Date().toISOString(),
  },
  {
    id: 236471852,
    full_name: "meshtastic/firmware",
    name: "firmware",
    owner: { login: "meshtastic", avatar_url: "https://avatars.githubusercontent.com/u/61466030?v=4" },
    description: "Meshtastic device firmware - An open source, off-grid, decentralized, mesh communication system for ESP32 and nRF52.",
    stargazers_count: 14200,
    forks_count: 1900,
    html_url: "https://github.com/meshtastic/firmware",
    topics: ["esp32", "lora", "mesh-networking", "off-grid", "ham-radio", "disaster-relief"],
    language: "C++",
    updated_at: new Date().toISOString(),
  },
  {
    id: 122807358,
    full_name: "esphome/esphome",
    name: "esphome",
    owner: { login: "esphome", avatar_url: "https://avatars.githubusercontent.com/u/41595166?v=4" },
    description: "ESPHome is a system to control your ESP8266/ESP32 by simple and yet powerful configuration files and control them remotely through Home Automation systems.",
    stargazers_count: 9200,
    forks_count: 3100,
    html_url: "https://github.com/esphome/esphome",
    topics: ["esp32", "esp8266", "home-assistant", "yaml", "sensors", "iot"],
    language: "Python",
    updated_at: new Date().toISOString(),
  },
  {
    id: 201246733,
    full_name: "justcallmekoko/ESP32Marauder",
    name: "ESP32Marauder",
    owner: { login: "justcallmekoko", avatar_url: "https://avatars.githubusercontent.com/u/10411267?v=4" },
    description: "A suite of WiFi & Bluetooth offensive and defensive tools for the ESP32 and Flipper Zero.",
    stargazers_count: 9800,
    forks_count: 1300,
    html_url: "https://github.com/justcallmekoko/ESP32Marauder",
    topics: ["esp32", "wifi", "bluetooth", "security", "pentesting", "wardriving"],
    language: "C++",
    updated_at: new Date().toISOString(),
  },
  {
    id: 15303721,
    full_name: "micropython/micropython",
    name: "micropython",
    owner: { login: "micropython", avatar_url: "https://avatars.githubusercontent.com/u/1487291?v=4" },
    description: "MicroPython - a lean and efficient Python implementation for microcontrollers and constrained systems (ESP32, RP2040, STM32).",
    stargazers_count: 19800,
    forks_count: 8100,
    html_url: "https://github.com/micropython/micropython",
    topics: ["python", "micropython", "esp32", "rp2040", "stm32", "embedded"],
    language: "C",
    updated_at: new Date().toISOString(),
  },
  {
    id: 243452668,
    full_name: "bdring/FluidNC",
    name: "FluidNC",
    owner: { login: "bdring", avatar_url: "https://avatars.githubusercontent.com/u/388245?v=4" },
    description: "The next generation of CNC control firmware for the ESP32 - High performance motion controller with WebUI.",
    stargazers_count: 2200,
    forks_count: 420,
    html_url: "https://github.com/bdring/FluidNC",
    topics: ["esp32", "cnc", "grbl", "gcode", "laser-cutting", "motion-control"],
    language: "C++",
    updated_at: new Date().toISOString(),
  },
  {
    id: 83287602,
    full_name: "adafruit/circuitpython",
    name: "circuitpython",
    owner: { login: "adafruit", avatar_url: "https://avatars.githubusercontent.com/u/181069?v=4" },
    description: "CircuitPython - a friendly open source Python implementation for beginners and pros on microcontrollers (RP2040, ESP32-S2/S3).",
    stargazers_count: 4800,
    forks_count: 1400,
    html_url: "https://github.com/adafruit/circuitpython",
    topics: ["circuitpython", "python", "rp2040", "esp32-s3", "adafruit"],
    language: "C",
    updated_at: new Date().toISOString(),
  },
  {
    id: 11119782,
    full_name: "gnea/grbl",
    name: "grbl",
    owner: { login: "gnea", avatar_url: "https://avatars.githubusercontent.com/u/23307612?v=4" },
    description: "An open source, embedded, high performance g-code-parser and CNC milling controller for AVR ATmega328 (Arduino Uno).",
    stargazers_count: 6700,
    forks_count: 3200,
    html_url: "https://github.com/gnea/grbl",
    topics: ["arduino", "atmega328", "cnc", "gcode", "milling"],
    language: "C",
    updated_at: new Date().toISOString(),
  },
];

// Helper to classify assets into flash roles & offsets
function classifyAssetItem(asset: {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
  download_count: number;
  content_type: string;
}): ClassifiedAsset {
  const lower = asset.name.toLowerCase();

  let role = "App Firmware";
  let suggestedOffsetHex = "0x10000";
  let suggestedOffsetNum = 0x10000;
  let chipTarget = "ESP32";

  // Chip family detection
  if (lower.includes("esp32s3") || lower.includes("esp32-s3") || lower.includes("s3")) {
    chipTarget = "ESP32-S3";
  } else if (lower.includes("esp32c3") || lower.includes("esp32-c3") || lower.includes("c3")) {
    chipTarget = "ESP32-C3";
  } else if (lower.includes("esp32c6") || lower.includes("esp32-c6") || lower.includes("c6")) {
    chipTarget = "ESP32-C6";
  } else if (lower.includes("esp32s2") || lower.includes("esp32-s2") || lower.includes("s2")) {
    chipTarget = "ESP32-S2";
  } else if (lower.includes("esp8266") || lower.includes("nodemcu") || lower.includes("d1_mini")) {
    chipTarget = "ESP8266";
  } else if (lower.endsWith(".hex") || lower.includes("atmega") || lower.includes("arduino")) {
    chipTarget = "AVR-Arduino";
  } else if (lower.endsWith(".uf2") || lower.includes("rp2040") || lower.includes("pico")) {
    chipTarget = "RP2040";
  } else if (lower.includes("stm32")) {
    chipTarget = "STM32";
  }

  // Partition role and offset detection
  if (lower.endsWith(".hex")) {
    role = "Intel HEX (.hex)";
    suggestedOffsetHex = "0x0";
    suggestedOffsetNum = 0x0;
  } else if (lower.endsWith(".uf2")) {
    role = "UF2 Bootloader Image";
    suggestedOffsetHex = "0x0";
    suggestedOffsetNum = 0x0;
  } else if (lower.includes("bootloader") || lower.includes("boot.bin")) {
    role = "Bootloader";
    const isS3C3 = chipTarget === "ESP32-S3" || chipTarget === "ESP32-C3" || chipTarget === "ESP32-C6";
    const offset = isS3C3 ? 0x0 : 0x1000;
    suggestedOffsetHex = `0x${offset.toString(16)}`;
    suggestedOffsetNum = offset;
  } else if (lower.includes("partition") || lower.includes("part.bin")) {
    role = "Partition Table";
    suggestedOffsetHex = "0x8000";
    suggestedOffsetNum = 0x8000;
  } else if (lower.includes("boot_app0") || lower.includes("otadata")) {
    role = "Boot App0 (OTA)";
    suggestedOffsetHex = "0xe000";
    suggestedOffsetNum = 0xe000;
  } else if (lower.includes("spiffs") || lower.includes("littlefs") || lower.includes("fs.bin")) {
    role = "Filesystem (LittleFS/SPIFFS)";
    suggestedOffsetHex = "0x290000";
    suggestedOffsetNum = 0x290000;
  } else if (
    lower.includes("factory") ||
    lower.includes("merged") ||
    lower.includes("full") ||
    lower.includes("all-in-one") ||
    chipTarget === "ESP8266"
  ) {
    role = "Factory Merged (.bin)";
    suggestedOffsetHex = "0x0";
    suggestedOffsetNum = 0x0;
  } else {
    role = "App Firmware";
    suggestedOffsetHex = "0x10000";
    suggestedOffsetNum = 0x10000;
  }

  const kb = asset.size / 1024;
  const sizeFormatted = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;

  return {
    id: asset.id,
    name: asset.name,
    size: asset.size,
    sizeFormatted,
    browser_download_url: asset.browser_download_url,
    download_count: asset.download_count,
    content_type: asset.content_type,
    role,
    suggestedOffsetHex,
    suggestedOffsetNum,
    chipTarget,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "search";
  const query = (searchParams.get("q") || "").trim();
  const owner = searchParams.get("owner")?.trim();
  const repo = searchParams.get("repo")?.trim();

  const githubToken = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "aegisFlasher/2.0 (EverythingHub Universal Firmware Suite; +https://www.everythinghub.com.tr)",
  };
  if (githubToken) {
    headers["Authorization"] = `Bearer ${githubToken}`;
  }

  // ─── ACTION: CURATED LIST ──────────────────────────────────────────
  if (action === "curated") {
    return NextResponse.json(
      { success: true, items: CURATED_REPOSITORIES, count: CURATED_REPOSITORIES.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // ─── ACTION: RELEASES FOR OWNER/REPO ───────────────────────────────
  if (action === "releases" || action === "release_latest") {
    if (!owner || !repo) {
      return NextResponse.json({ error: "Missing 'owner' or 'repo' query parameter." }, { status: 400 });
    }

    try {
      const endpoint =
        action === "release_latest"
          ? `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`
          : `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=20`;

      const ghRes = await fetch(endpoint, {
        headers,
        next: { revalidate: 300 },
      });

      if (!ghRes.ok) {
        // Fallback for 404 or rate limit: return empty gracefully
        if (ghRes.status === 404) {
          return NextResponse.json({ success: true, releases: [], message: "No releases found for this repository." });
        }
        throw new Error(`GitHub Upstream returned ${ghRes.status}`);
      }

      const rawData = await ghRes.json();
      const rawList = Array.isArray(rawData) ? rawData : [rawData];

      const cleanReleases: CleanReleaseInfo[] = rawList.map((r: any) => {
        const rawAssets = Array.isArray(r.assets) ? r.assets : [];
        const validAssets = rawAssets
          .filter((a: any) => {
            const lower = (a.name || "").toLowerCase();
            return (
              lower.endsWith(".bin") ||
              lower.endsWith(".hex") ||
              lower.endsWith(".uf2") ||
              lower.endsWith(".elf") ||
              lower.endsWith(".zip") ||
              lower.endsWith(".tar.gz")
            );
          })
          .map((a: any) => classifyAssetItem(a));

        return {
          id: r.id,
          tag_name: r.tag_name,
          name: r.name || r.tag_name,
          published_at: r.published_at || r.created_at,
          body: r.body,
          prerelease: Boolean(r.prerelease),
          assets: validAssets,
        };
      });

      return NextResponse.json(
        {
          success: true,
          owner,
          repo,
          releases: cleanReleases,
          totalReleases: cleanReleases.length,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
          },
        }
      );
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch releases: ${err.message}`,
        },
        { status: 502 }
      );
    }
  }

  // ─── ACTION: REPOSITORY SEARCH ─────────────────────────────────────
  if (action === "search") {
    if (!query) {
      return NextResponse.json({ success: true, items: CURATED_REPOSITORIES });
    }

    try {
      // Check if user entered an exact owner/repo pattern (e.g. "Aircoookie/WLED")
      const directMatch = query.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
      if (directMatch) {
        const o = directMatch[1];
        const r = directMatch[2].replace(/\.git$/, "");
        const singleRepoRes = await fetch(`https://api.github.com/repos/${o}/${r}`, {
          headers,
          next: { revalidate: 300 },
        });
        if (singleRepoRes.ok) {
          const item = await singleRepoRes.json();
          return NextResponse.json({
            success: true,
            items: [
              {
                id: item.id,
                full_name: item.full_name,
                name: item.name,
                owner: { login: item.owner?.login, avatar_url: item.owner?.avatar_url },
                description: item.description,
                stargazers_count: item.stargazers_count,
                forks_count: item.forks_count,
                html_url: item.html_url,
                topics: item.topics || [],
                language: item.language,
                updated_at: item.updated_at,
              },
            ],
          });
        }
      }

      // Search GitHub API with smart query formulation
      const searchTarget = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}+in:name,description,topics&sort=stars&order=desc&per_page=15`;

      const ghRes = await fetch(searchTarget, {
        headers,
        next: { revalidate: 300 },
      });

      if (!ghRes.ok) {
        // Fallback to local curated search if GitHub rate limits or errors
        const qLower = query.toLowerCase();
        const fallbackItems = CURATED_REPOSITORIES.filter(
          (c) =>
            c.name.toLowerCase().includes(qLower) ||
            c.full_name.toLowerCase().includes(qLower) ||
            (c.description && c.description.toLowerCase().includes(qLower)) ||
            (c.topics && c.topics.some((t) => t.toLowerCase().includes(qLower)))
        );

        return NextResponse.json({
          success: true,
          items: fallbackItems,
          isFallback: true,
          message: `GitHub search rate-limited; returning curated results.`,
        });
      }

      const data = await ghRes.json();
      const items: GitHubRepoResponseItem[] = (data.items || []).map((item: any) => ({
        id: item.id,
        full_name: item.full_name,
        name: item.name,
        owner: { login: item.owner?.login, avatar_url: item.owner?.avatar_url },
        description: item.description,
        stargazers_count: item.stargazers_count,
        forks_count: item.forks_count,
        html_url: item.html_url,
        topics: item.topics || [],
        language: item.language,
        updated_at: item.updated_at,
      }));

      return NextResponse.json(
        {
          success: true,
          items,
          totalCount: data.total_count || items.length,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
          },
        }
      );
    } catch (err: any) {
      // Local fallback in case of network crash
      const qLower = query.toLowerCase();
      const fallbackItems = CURATED_REPOSITORIES.filter(
        (c) =>
          c.name.toLowerCase().includes(qLower) ||
          c.full_name.toLowerCase().includes(qLower) ||
          (c.description && c.description.toLowerCase().includes(qLower))
      );

      return NextResponse.json({
        success: true,
        items: fallbackItems,
        isFallback: true,
        error: err.message,
      });
    }
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
