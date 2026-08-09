import { copyToClipboard } from "./utils";

export type SpotifyInputType = "playlist" | "user" | "artist" | "album" | "track" | null;

export function unescapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/<[^>]*>/g, "") // Strip HTML tags like <p>, <i>, <a>
    .trim();
}

export interface SpotifyParsedUrl {
  type: SpotifyInputType;
  id: string | null;
  originalUrl: string;
}

export interface AudioFeatures {
  energy: number; // 0 to 1
  danceability: number; // 0 to 1
  valence: number; // 0 to 1 (mood positivity)
  acousticness: number; // 0 to 1
  instrumentalness: number; // 0 to 1
  liveness: number; // 0 to 1
  speechiness: number; // 0 to 1
  tempo: number; // BPM
  loudness: number; // dB
  key: number; // 0-11
  mode: number; // 0 (minor), 1 (major)
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id?: string }[];
  albumName: string;
  albumCover: string;
  durationMs: number;
  popularity: number;
  releaseDate: string;
  isrc?: string;
  explicit: boolean;
  previewUrl?: string | null;
  audioFeatures: AudioFeatures;
}

export interface BotFlags {
  artistStuffing: boolean;
  artistStuffingDetails?: string;
  shortDurationAnomaly: boolean;
  shortDurationDetails?: string;
  bimodalPopularityAnomaly: boolean;
  bimodalDetails?: string;
  duplicateTracksCount: number;
}

export interface DominantMood {
  tag: "chill" | "workout" | "melancholic" | "focus" | "party";
  labelTr: string;
  labelEn: string;
  descriptionTr: string;
  descriptionEn: string;
}

export interface SpotifyPlaylistAnalysis {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  ownerId: string;
  followers: number | null;
  isFollowersHidden?: boolean;
  coverArtUrl: string;
  dominantColor: string;
  tracks: SpotifyTrack[];
  totalTracks: number;
  totalDurationSeconds: number;
  uniqueArtistsCount: number;
  uniqueAlbumsCount: number;
  explicitTrackCount: number;
  averagePopularity: number;
  qualityScore: number; // 0 to 100
  riskLevel: "safe" | "moderate" | "high_risk";
  botFlags: BotFlags;
  pitchingVerdict: string;
  audioFeaturesSummary: {
    avgEnergy: number;
    avgDanceability: number;
    avgValence: number;
    avgAcousticness: number;
    avgInstrumentalness: number;
    avgLiveness: number;
    avgSpeechiness: number;
    avgTempo: number;
    medianTempo: number;
    avgLoudness: number;
  };
  dominantMood: DominantMood;
  topGenres: { genre: string; count: number; percentage: number }[];
  keyDistribution: { keyName: string; camelot: string; count: number; percentage: number }[];
  decadeDistribution: { decade: string; count: number; percentage: number }[];
  artistDiversityHHI: number;
  duplicates: { originalTrack: SpotifyTrack; duplicateTrack: SpotifyTrack; reason: string }[];
}

export interface PublicPlaylistSummary {
  id: string;
  title: string;
  coverUrl: string;
  tracksCount: number;
  followersCount: number;
}

export interface DiscographyItem {
  id: string;
  title: string;
  releaseDate: string;
  type: "album" | "single" | "compilation";
  coverUrl: string;
  totalTracks: number;
}

export interface SpotifyProfileAnalysis {
  id: string;
  type: "user" | "artist";
  name: string;
  avatarUrl: string;
  bannerUrl?: string;
  followers: number | null;
  monthlyListeners?: number | null;
  isFollowersHidden?: boolean;
  privacyNotice?: string;
  popularity?: number;
  verified?: boolean;
  bio?: string;
  publicPlaylists: PublicPlaylistSummary[];
  topTracks?: SpotifyTrack[];
  discography?: DiscographyItem[];
  genres?: string[];
  totalFollowerReach: number;
  searchQuery?: string;
  sourceOrigin?: string;
}

const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CAMELOT_KEYS_MAJOR = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"];
const CAMELOT_KEYS_MINOR = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"];

export function parseSpotifyUrl(input: string): SpotifyParsedUrl {
  if (!input || typeof input !== "string") {
    return { type: null, id: null, originalUrl: input || "" };
  }

  const trimmed = input.trim();

  // Spotify URI format: spotify:playlist:37i9dQZF1DXcBWIGoYBM5M, spotify:user:mr.spy
  const uriMatch = trimmed.match(/^spotify:(playlist|user|artist|album|track):([a-zA-Z0-9._\-~%]+)/i);
  if (uriMatch) {
    return {
      type: uriMatch[1].toLowerCase() as SpotifyInputType,
      id: uriMatch[2],
      originalUrl: trimmed,
    };
  }

  // Spotify URL format: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=... or /intl-tr/artist/... or /embed/user/...
  const urlMatch = trimmed.match(/open\.spotify\.com\/(?:embed\/|(?:intl-[a-z]{2,4}\/))?(playlist|user|artist|album|track)\/([a-zA-Z0-9._\-~%]+)/i);
  if (urlMatch) {
    return {
      type: urlMatch[1].toLowerCase() as SpotifyInputType,
      id: urlMatch[2].split("?")[0],
      originalUrl: trimmed,
    };
  }

  // If plain 22-char Spotify ID
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return {
      type: "artist",
      id: trimmed,
      originalUrl: trimmed,
    };
  }

  // If text or artist name (e.g. "Taylor Swift", "The Weeknd", "Billie Eilish")
  return {
    type: "artist",
    id: null,
    originalUrl: trimmed,
  };
}

export function formatKeyAndCamelot(key: number, mode: number): { name: string; camelot: string } {
  if (key < 0 || key > 11) return { name: "Unknown", camelot: "12A" };
  const basePitch = PITCH_NAMES[key];
  const modeName = mode === 1 ? "Majör" : "Minör";
  const camelot = mode === 1 ? CAMELOT_KEYS_MAJOR[key] : CAMELOT_KEYS_MINOR[key];
  return { name: `${basePitch} ${modeName}`, camelot };
}

export function calculateBotAndSafetyScore(tracks: SpotifyTrack[]): {
  score: number;
  riskLevel: "safe" | "moderate" | "high_risk";
  botFlags: BotFlags;
  pitchingVerdict: string;
  artistDiversityHHI: number;
  duplicates: { originalTrack: SpotifyTrack; duplicateTrack: SpotifyTrack; reason: string }[];
} {
  if (!tracks || tracks.length === 0) {
    return {
      score: 100,
      riskLevel: "safe",
      botFlags: {
        artistStuffing: false,
        shortDurationAnomaly: false,
        bimodalPopularityAnomaly: false,
        duplicateTracksCount: 0,
      },
      pitchingVerdict: "Çalma listesi veri içeriyor, organik kabul edilebilir.",
      artistDiversityHHI: 0.05,
      duplicates: [],
    };
  }

  let penalty = 0;

  // 1. Artist Stuffing / Concentration
  const artistCounts: Record<string, number> = {};
  tracks.forEach((t) => {
    const primaryArtist = t.artists[0]?.name || "Unknown";
    artistCounts[primaryArtist] = (artistCounts[primaryArtist] || 0) + 1;
  });

  const totalTracks = tracks.length;
  let maxArtistTracks = 0;
  let maxArtistName = "";
  let sumSqShares = 0;

  Object.entries(artistCounts).forEach(([name, count]) => {
    if (count > maxArtistTracks) {
      maxArtistTracks = count;
      maxArtistName = name;
    }
    const share = count / totalTracks;
    sumSqShares += share * share;
  });

  const artistStuffingRatio = maxArtistTracks / totalTracks;
  const artistStuffing = artistStuffingRatio > 0.25 && totalTracks > 15;
  if (artistStuffing) {
    penalty += Math.min(35, Math.round(artistStuffingRatio * 50));
  }

  // 2. Short Duration Anomaly (< 90 seconds = typical stream farming trick)
  const shortTracks = tracks.filter((t) => t.durationMs < 90000);
  const shortRatio = shortTracks.length / totalTracks;
  const shortDurationAnomaly = shortRatio > 0.15 && totalTracks > 10;
  if (shortDurationAnomaly) {
    penalty += Math.min(30, Math.round(shortRatio * 60));
  }

  // 3. Bimodal Popularity Anomaly (1 hit + 40 zero-pop tracks)
  const popHits = tracks.filter((t) => t.popularity >= 65).length;
  const popZeroes = tracks.filter((t) => t.popularity <= 5).length;
  const bimodalPopularityAnomaly = popHits >= 1 && popZeroes / totalTracks > 0.5;
  if (bimodalPopularityAnomaly) {
    penalty += 25;
  }

  // 4. Duplicate Scanner
  const duplicates: { originalTrack: SpotifyTrack; duplicateTrack: SpotifyTrack; reason: string }[] = [];
  const seenIds = new Set<string>();
  const seenTitles = new Map<string, SpotifyTrack>();

  tracks.forEach((t) => {
    const titleKey = `${t.name.toLowerCase().trim()} - ${t.artists[0]?.name.toLowerCase().trim()}`;
    if (seenIds.has(t.id)) {
      duplicates.push({
        originalTrack: t,
        duplicateTrack: t,
        reason: "Birebir Spotify ID Eşleşmesi",
      });
    } else if (t.isrc && tracks.some((other) => other.id !== t.id && other.isrc === t.isrc)) {
      const match = tracks.find((other) => other.id !== t.id && other.isrc === t.isrc)!;
      duplicates.push({
        originalTrack: match,
        duplicateTrack: t,
        reason: `Birebir ISRC Kopyası (${t.isrc})`,
      });
    } else if (seenTitles.has(titleKey)) {
      duplicates.push({
        originalTrack: seenTitles.get(titleKey)!,
        duplicateTrack: t,
        reason: "İsim ve Sanatçı Eşleşmesi",
      });
    } else {
      seenIds.add(t.id);
      seenTitles.set(titleKey, t);
    }
  });

  if (duplicates.length > 0) {
    penalty += Math.min(20, duplicates.length * 5);
  }

  const score = Math.max(10, Math.min(100, 100 - penalty));
  let riskLevel: "safe" | "moderate" | "high_risk" = "safe";
  let pitchingVerdict = "";

  if (score >= 80) {
    riskLevel = "safe";
    pitchingVerdict = "Bu çalma listesi organik dinleyici profiline ve sağlıklı sanatçı çeşitliliğine sahip. Müzik pitching ve tanıtım için GÜVENLİDİR.";
  } else if (score >= 50) {
    riskLevel = "moderate";
    pitchingVerdict = "Bu listede bazı sanatçı yoğunlaşmaları veya popülerlik dengesizlikleri tespit edildi. Şarkı ekletmeden önce küratörü incelemeniz önerilir.";
  } else {
    riskLevel = "high_risk";
    pitchingVerdict = "DİKKAT: Yüksek ihtimalle bot veya payola listesi! Kısa şarkı stuffing, tekil sanatçı domine etmesi veya sahte dinlenme anomalileri tespit edildi. Tanıtım bütçenizi riske atmayın.";
  }

  return {
    score,
    riskLevel,
    botFlags: {
      artistStuffing,
      artistStuffingDetails: artistStuffing
        ? `Tüm listenin %${Math.round(artistStuffingRatio * 100)} kadarı tek bir sanatçıya ("${maxArtistName}") ait.`
        : undefined,
      shortDurationAnomaly,
      shortDurationDetails: shortDurationAnomaly
        ? `Listenin %${Math.round(shortRatio * 100)} kadarı 90 saniyenin altında kısa parçalardan oluşuyor.`
        : undefined,
      bimodalPopularityAnomaly,
      bimodalDetails: bimodalPopularityAnomaly
        ? "Yüksek popülerliğe sahip 1-2 şarkının arkasına gizlenmiş sıfır popülerlikli sahte şarkılar bulundu."
        : undefined,
      duplicateTracksCount: duplicates.length,
    },
    pitchingVerdict,
    artistDiversityHHI: Number(sumSqShares.toFixed(3)),
    duplicates,
  };
}

export function classifyDominantMood(avgValence: number, avgEnergy: number): DominantMood {
  if (avgEnergy > 0.75 && avgValence > 0.6) {
    return {
      tag: "party",
      labelTr: "Parti & Dans",
      labelEn: "Party & Dance",
      descriptionTr: "Yüksek ritim, coşkulu vokaller ve dans edilebilir enerjik parçalar.",
      descriptionEn: "High-bpm, euphoric vocals, and energetic dance tracks.",
    };
  }
  if (avgEnergy > 0.7) {
    return {
      tag: "workout",
      labelTr: "Yüksek Enerjili Spor & Fitness",
      labelEn: "High Energy & Workout",
      descriptionTr: "Adrenalin yükselten ritimler, synth bass ve motivasyon parçaları.",
      descriptionEn: "Adrenaline-boosting beats, heavy synth bass, and workout anthems.",
    };
  }
  if (avgValence < 0.4 && avgEnergy < 0.5) {
    return {
      tag: "melancholic",
      labelTr: "Melankolik & Duygusal",
      labelEn: "Melancholic & Emotional",
      descriptionTr: "Derin duygusal vokaller, akustik tonlar ve nostaljik atmosfer.",
      descriptionEn: "Deep emotional vocals, intimate acoustics, and nostalgic moods.",
    };
  }
  if (avgEnergy < 0.45) {
    return {
      tag: "focus",
      labelTr: "Derin Odaklanma & Lo-Fi Study",
      labelEn: "Deep Focus & Lo-Fi Study",
      descriptionTr: "Akustik ve enstrümantal rahatlatıcı sesler, sakin çalışma atmosferi.",
      descriptionEn: "Acoustic & instrumental ambient textures, ideal for deep focus and reading.",
    };
  }
  return {
    tag: "chill",
    labelTr: "Sakin & Keyifli Dinlenme",
    labelEn: "Chill & Relaxed Lounge",
    descriptionTr: "Dengeli enstrümanlar, sıcak akorlar ve huzurlu ritim akışı.",
    descriptionEn: "Balanced instrumentation, warm chords, and soothing rhythm flow.",
  };
}

export function exportPlaylistCSV(playlist: SpotifyPlaylistAnalysis): string {
  const headers = [
    "Şarkı Adı",
    "Ana Sanatçı",
    "Tüm Sanatçılar",
    "Albüm Adı",
    "Süre (dk:sn)",
    "BPM (Tempo)",
    "Key & Mod",
    "Enerji (%)",
    "Dans Edilebilirlik (%)",
    "Valence (%)",
    "Popülerlik",
    "Çıkış Tarihi",
    "ISRC Kodu",
    "Explicit",
    "Spotify ID",
  ];

  const delimiter = ";"; // Semicolon for Turkish/European Windows Excel compatibility

  const clean = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;

  const rows = playlist.tracks.map((t) => {
    const { name: keyName } = formatKeyAndCamelot(t.audioFeatures.key, t.audioFeatures.mode);
    const durSec = Math.round(t.durationMs / 1000);
    const m = Math.floor(durSec / 60);
    const s = String(durSec % 60).padStart(2, "0");

    return [
      clean(t.name),
      clean(t.artists[0]?.name || ""),
      clean(t.artists.map((a) => a.name).join(", ")),
      clean(t.albumName),
      clean(`${m}:${s}`),
      t.audioFeatures.tempo,
      clean(keyName),
      Math.round(t.audioFeatures.energy * 100),
      Math.round(t.audioFeatures.danceability * 100),
      Math.round(t.audioFeatures.valence * 100),
      t.popularity,
      clean(t.releaseDate || ""),
      clean(t.isrc || ""),
      t.explicit ? "EVET" : "HAYIR",
      clean(t.id),
    ].join(delimiter);
  });

  // \uFEFF is UTF-8 Byte Order Mark (BOM) for Excel
  return "\uFEFF" + [headers.join(delimiter), ...rows].join("\n");
}

export function exportDJSetlistMarkdown(playlist: SpotifyPlaylistAnalysis): string {
  let md = `# DJ Setlist & Sonic Breakdown: ${playlist.title}\n`;
  md += `> **Curator:** ${playlist.ownerName} | **Tracks:** ${playlist.totalTracks} | **Avg BPM:** ${playlist.audioFeaturesSummary.avgTempo} BPM\n\n`;
  md += `| # | Track Name | Artist | BPM | Key & Camelot | Energy | Duration |\n`;
  md += `|---|------------|--------|-----|---------------|--------|----------|\n`;

  playlist.tracks.forEach((t, i) => {
    const { name: keyName, camelot } = formatKeyAndCamelot(t.audioFeatures.key, t.audioFeatures.mode);
    const durSec = Math.round(t.durationMs / 1000);
    const m = Math.floor(durSec / 60);
    const s = String(durSec % 60).padStart(2, "0");
    md += `| ${i + 1} | ${t.name} | ${t.artists.map((a) => a.name).join(", ")} | ${t.audioFeatures.tempo} | ${camelot} (${keyName}) | ${Math.round(t.audioFeatures.energy * 100)}% | ${m}:${s} |\n`;
  });

  return md;
}

// Rich Real-World Demo Datasets for Instant Testing
export const DEMO_PLAYLISTS: Record<string, SpotifyPlaylistAnalysis> = {
  "global-top-50": {
    id: "37i9dQZF1DXcBWIGoYBM5M",
    title: "Today's Top Hits (Global)",
    description: "The hottest 50 tracks worldwide right now. Updated daily.",
    ownerName: "Spotify",
    ownerId: "spotify",
    followers: 34820190,
    coverArtUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    dominantColor: "#10b981",
    totalTracks: 50,
    totalDurationSeconds: 9840,
    uniqueArtistsCount: 42,
    uniqueAlbumsCount: 48,
    explicitTrackCount: 22,
    averagePopularity: 88,
    qualityScore: 98,
    riskLevel: "safe",
    botFlags: {
      artistStuffing: false,
      shortDurationAnomaly: false,
      bimodalPopularityAnomaly: false,
      duplicateTracksCount: 0,
    },
    pitchingVerdict: "Bu resmi Spotify editoryal listesi %100 organik akışa ve dünya standartlarında sanatçı çeşitliliğine sahiptir.",
    audioFeaturesSummary: {
      avgEnergy: 0.68,
      avgDanceability: 0.74,
      avgValence: 0.61,
      avgAcousticness: 0.22,
      avgInstrumentalness: 0.04,
      avgLiveness: 0.16,
      avgSpeechiness: 0.09,
      avgTempo: 122,
      medianTempo: 120,
      avgLoudness: -5.4,
    },
    dominantMood: {
      tag: "party",
      labelTr: "Parti & Dans",
      labelEn: "Party & Dance",
      descriptionTr: "Küresel pop, hip-hop ve dans ritimleri.",
      descriptionEn: "Global pop, hip-hop, and dance anthems.",
    },
    topGenres: [
      { genre: "Pop", count: 22, percentage: 44 },
      { genre: "Dance Pop", count: 12, percentage: 24 },
      { genre: "Hip-Hop / Trap", count: 9, percentage: 18 },
      { genre: "Contemporary R&B", count: 7, percentage: 14 },
    ],
    keyDistribution: [
      { keyName: "C Majör", camelot: "8B", count: 9, percentage: 18 },
      { keyName: "G Majör", camelot: "9B", count: 8, percentage: 16 },
      { keyName: "A Minör", camelot: "8A", count: 7, percentage: 14 },
      { keyName: "F# Minör", camelot: "11A", count: 6, percentage: 12 },
      { keyName: "D Majör", camelot: "10B", count: 5, percentage: 10 },
      { keyName: "Diğer Tonlar", camelot: "Var", count: 15, percentage: 30 },
    ],
    decadeDistribution: [
      { decade: "2020s", count: 50, percentage: 100 },
    ],
    artistDiversityHHI: 0.028,
    duplicates: [],
    tracks: Array.from({ length: 25 }, (_, i) => ({
      id: `top-track-${i + 1}`,
      name: [
        "Espresso", "Birds of a Feather", "Please Please Please", "Good Luck, Babe!", "Not Like Us",
        "A Bar Song (Tipsy)", "Too Sweet", "Lose Control", "I Had Some Help", "Greedy",
        "Cruel Summer", "Beautiful Things", "One Of The Girls", "Water", "Houdini",
        "Fortnight", "Paint The Town Red", "Stick Season", "Vampire", "Flowers",
        "As It Was", "Stay", "Blinding Lights", "Levitating", "Starboy"
      ][i],
      artists: [{ name: ["Sabrina Carpenter", "Billie Eilish", "Sabrina Carpenter", "Chappell Roan", "Kendrick Lamar", "Shaboozey", "Hozier", "Teddy Swims", "Post Malone ft. Morgan Wallen", "Tate McRae", "Taylor Swift", "Benson Boone", "The Weeknd, JENNIE, Lily-Rose Depp", "Tyla", "Dua Lipa", "Taylor Swift ft. Post Malone", "Doja Cat", "Noah Kahan", "Olivia Rodrigo", "Miley Cyrus", "Harry Styles", "The Kid LAROI & Justin Bieber", "The Weeknd", "Dua Lipa", "The Weeknd"][i] }],
      albumName: `Hit Album ${i + 1}`,
      albumCover: [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80"
      ][i % 3],
      durationMs: 160000 + (i * 4500) % 90000,
      popularity: 92 - (i % 8),
      releaseDate: "2024-05-15",
      explicit: i % 3 === 0,
      audioFeatures: {
        energy: 0.65 + ((i * 7) % 30) / 100,
        danceability: 0.70 + ((i * 5) % 25) / 100,
        valence: 0.55 + ((i * 9) % 35) / 100,
        acousticness: 0.10 + ((i * 3) % 20) / 100,
        instrumentalness: 0.01,
        liveness: 0.12,
        speechiness: 0.08,
        tempo: 115 + (i * 3) % 35,
        loudness: -4.8,
        key: (i * 2) % 12,
        mode: i % 2,
      },
    })),
  },
  "lofi-beats": {
    id: "0vvXsWCC9xrXsKd4FyS8M0",
    title: "Lo-Fi Study Beats & Chill Vibe",
    description: "Peaceful lofi hip hop beats for studying, relaxing, or working late at night.",
    ownerName: "Lofi Girl",
    ownerId: "lofigirl",
    followers: 7420110,
    coverArtUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80",
    dominantColor: "#8b5cf6",
    totalTracks: 60,
    totalDurationSeconds: 8640,
    uniqueArtistsCount: 45,
    uniqueAlbumsCount: 52,
    explicitTrackCount: 0,
    averagePopularity: 62,
    qualityScore: 94,
    riskLevel: "safe",
    botFlags: {
      artistStuffing: false,
      shortDurationAnomaly: false,
      bimodalPopularityAnomaly: false,
      duplicateTracksCount: 0,
    },
    pitchingVerdict: "Derin çalışma ve uyku odaklı organik Lo-Fi listesi. Akustik ve dinlendirici ses yapısına sahiptir.",
    audioFeaturesSummary: {
      avgEnergy: 0.32,
      avgDanceability: 0.62,
      avgValence: 0.44,
      avgAcousticness: 0.78,
      avgInstrumentalness: 0.85,
      avgLiveness: 0.11,
      avgSpeechiness: 0.06,
      avgTempo: 84,
      medianTempo: 82,
      avgLoudness: -12.4,
    },
    dominantMood: {
      tag: "focus",
      labelTr: "Derin Odaklanma & Lo-Fi Study",
      labelEn: "Deep Focus & Lo-Fi Study",
      descriptionTr: "Yumuşak caz akorları ve sakinleştirici enstrümantal vuruşlar.",
      descriptionEn: "Soft jazz chords and soothing ambient instrumental beats.",
    },
    topGenres: [
      { genre: "Lofi Hip Hop", count: 38, percentage: 63 },
      { genre: "Chillhop", count: 14, percentage: 23 },
      { genre: "Ambient Jazz", count: 8, percentage: 14 },
    ],
    keyDistribution: [
      { keyName: "F Majör", camelot: "7B", count: 12, percentage: 20 },
      { keyName: "C Minör", camelot: "5A", count: 10, percentage: 17 },
      { keyName: "E Minör", camelot: "9A", count: 9, percentage: 15 },
      { keyName: "D Minör", camelot: "7A", count: 8, percentage: 13 },
      { keyName: "Diğer Tonlar", camelot: "Var", count: 21, percentage: 35 },
    ],
    decadeDistribution: [
      { decade: "2020s", count: 52, percentage: 87 },
      { decade: "2010s", count: 8, percentage: 13 },
    ],
    artistDiversityHHI: 0.031,
    duplicates: [],
    tracks: Array.from({ length: 20 }, (_, i) => ({
      id: `lofi-track-${i + 1}`,
      name: [
        "Midnight Rain", "Coffee at 3 AM", "Tokyo Raindrops", "Study Session", "Cozy Bedroom",
        "Library Books", "Soft Piano Whispers", "Late Night Thoughts", "Warm Blanket", "Fading Stars",
        "Cat on Window", "Vinyl Scratch", "Autumn Leaves", "Chilly Morning", "Silent Snow",
        "Drifting Away", "Moonlight Serenade", "Memory Lane", "Distant City Lights", "Sleepy Head"
      ][i],
      artists: [{ name: ["Kalaido", "Kudasaibeats", "Idealism", "Jinsang", "SwuM", "Sleeperman", "Potsu", "Nujabes Tribe", "Sarcastic Sounds", "Burbank"][i % 10] }],
      albumName: `Lo-Fi Collection Vol. ${Math.floor(i / 5) + 1}`,
      albumCover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
      durationMs: 135000 + (i * 2000),
      popularity: 65 - (i % 10),
      releaseDate: "2023-11-04",
      explicit: false,
      audioFeatures: {
        energy: 0.28 + (i % 10) / 100,
        danceability: 0.58 + (i % 8) / 100,
        valence: 0.40 + (i % 12) / 100,
        acousticness: 0.75 + (i % 15) / 100,
        instrumentalness: 0.88,
        liveness: 0.10,
        speechiness: 0.05,
        tempo: 78 + (i * 2) % 16,
        loudness: -13.2,
        key: (i * 3) % 12,
        mode: 0,
      },
    })),
  },
  "synthwave-80s": {
    id: "37i9dQZF1DXdLENyoTwsSZ",
    title: "Synthwave & Cyberpunk 2077 Night Drive",
    description: "Retrofuturistic neon synthesizers, dark synth, and 80s electronic driving anthems.",
    ownerName: "Synthwave Collective",
    ownerId: "synthwave",
    followers: 1890400,
    coverArtUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
    dominantColor: "#ec4899",
    totalTracks: 45,
    totalDurationSeconds: 11880,
    uniqueArtistsCount: 30,
    uniqueAlbumsCount: 38,
    explicitTrackCount: 1,
    averagePopularity: 71,
    qualityScore: 92,
    riskLevel: "safe",
    botFlags: {
      artistStuffing: false,
      shortDurationAnomaly: false,
      bimodalPopularityAnomaly: false,
      duplicateTracksCount: 0,
    },
    pitchingVerdict: "Yüksek enerjili, tematik neon synthwave ve 80ler elektronik dinleyici kitlesine sahip sağlıklı liste.",
    audioFeaturesSummary: {
      avgEnergy: 0.82,
      avgDanceability: 0.65,
      avgValence: 0.54,
      avgAcousticness: 0.05,
      avgInstrumentalness: 0.62,
      avgLiveness: 0.14,
      avgSpeechiness: 0.05,
      avgTempo: 118,
      medianTempo: 116,
      avgLoudness: -6.2,
    },
    dominantMood: {
      tag: "workout",
      labelTr: "Yüksek Enerjili Spor & Night Drive",
      labelEn: "High Energy & Night Drive",
      descriptionTr: "Neon ışıklar altında gece sürüşü ve 80'ler retro synth enerjisi.",
      descriptionEn: "Neon night driving anthems with intense 80s retro synth energy.",
    },
    topGenres: [
      { genre: "Synthwave", count: 25, percentage: 56 },
      { genre: "Darksynth", count: 12, percentage: 27 },
      { genre: "Electro Retro", count: 8, percentage: 17 },
    ],
    keyDistribution: [
      { keyName: "A Minör", camelot: "8A", count: 14, percentage: 31 },
      { keyName: "D Minör", camelot: "7A", count: 10, percentage: 22 },
      { keyName: "F# Minör", camelot: "11A", count: 8, percentage: 18 },
      { keyName: "C Minör", camelot: "5A", count: 6, percentage: 13 },
      { keyName: "Diğer Tonlar", camelot: "Var", count: 7, percentage: 16 },
    ],
    decadeDistribution: [
      { decade: "2020s", count: 30, percentage: 67 },
      { decade: "2010s", count: 15, percentage: 33 },
    ],
    artistDiversityHHI: 0.042,
    duplicates: [],
    tracks: Array.from({ length: 18 }, (_, i) => ({
      id: `synth-track-${i + 1}`,
      name: [
        "Tech Noir", "Resonance", "Turbo Killer", "Nightcall", "Sunset Drive",
        "Vampires", "Dust", "Outrun", "Cyber City", "Chrome Horizon",
        "Laser Hawk", "Palms & Neon", "Overdrive", "Arcade Dreams", "Grid Runner",
        "Midnight City", "Starchild", "Ghost In The Machine"
      ][i],
      artists: [{ name: ["GUNSHIP", "HOME", "Carpenter Brut", "Kavinsky", "The Midnight", "Timecop1983", "MOON", "Scandroid", "Dance With the Dead", "Lazerhawk"][i % 10] }],
      albumName: `Synthwave Collection ${i + 1}`,
      albumCover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
      durationMs: 240000 + (i * 3000),
      popularity: 78 - (i % 8),
      releaseDate: "2021-08-12",
      explicit: false,
      audioFeatures: {
        energy: 0.80 + (i % 12) / 100,
        danceability: 0.62 + (i % 10) / 100,
        valence: 0.50 + (i % 14) / 100,
        acousticness: 0.04,
        instrumentalness: 0.65,
        liveness: 0.12,
        speechiness: 0.05,
        tempo: 110 + (i * 2) % 20,
        loudness: -5.8,
        key: (i * 5) % 12,
        mode: 0,
      },
    })),
  },
  "anatolian-rock": {
    id: "37i9dQZF1DX6Xce6aL82lM",
    title: "Anadolu Rock & Türkçe Klasikler",
    description: "Barış Manço, Cem Karaca, Erkin Koray ve efsanevi Türkçe rock ruhu.",
    ownerName: "EverythingHub Music",
    ownerId: "everythinghub",
    followers: 940200,
    coverArtUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
    dominantColor: "#f59e0b",
    totalTracks: 55,
    totalDurationSeconds: 14850,
    uniqueArtistsCount: 22,
    uniqueAlbumsCount: 45,
    explicitTrackCount: 0,
    averagePopularity: 68,
    qualityScore: 96,
    riskLevel: "safe",
    botFlags: {
      artistStuffing: false,
      shortDurationAnomaly: false,
      bimodalPopularityAnomaly: false,
      duplicateTracksCount: 0,
    },
    pitchingVerdict: "Efsanevi Anadolu rock ve psych-rock mirasını barındıran %100 özgün ve kült dinleyici kitlesine sahip liste.",
    audioFeaturesSummary: {
      avgEnergy: 0.66,
      avgDanceability: 0.58,
      avgValence: 0.64,
      avgAcousticness: 0.35,
      avgInstrumentalness: 0.18,
      avgLiveness: 0.22,
      avgSpeechiness: 0.05,
      avgTempo: 116,
      medianTempo: 114,
      avgLoudness: -7.5,
    },
    dominantMood: {
      tag: "chill",
      labelTr: "Zaman Sınırlarını Aşan Anadolu Rock Vibe",
      labelEn: "Timeless Anatolian Rock Vibe",
      descriptionTr: "Bağlama ve elektro gitar sentezi, zengin Türkçe şiirsel vokaller.",
      descriptionEn: "Psych-rock guitars blended with traditional Anatolian lutes and poetic vocals.",
    },
    topGenres: [
      { genre: "Anadolu Rock", count: 32, percentage: 58 },
      { genre: "Turkish Psych Rock", count: 15, percentage: 27 },
      { genre: "Turkish Pop Rock", count: 8, percentage: 15 },
    ],
    keyDistribution: [
      { keyName: "A Minör", camelot: "8A", count: 18, percentage: 33 },
      { keyName: "E Minör", camelot: "9A", count: 12, percentage: 22 },
      { keyName: "D Minör", camelot: "7A", count: 10, percentage: 18 },
      { keyName: "G Majör", camelot: "9B", count: 8, percentage: 15 },
      { keyName: "Diğer Tonlar", camelot: "Var", count: 7, percentage: 12 },
    ],
    decadeDistribution: [
      { decade: "1970s", count: 28, percentage: 51 },
      { decade: "1980s", count: 15, percentage: 27 },
      { decade: "1990s", count: 8, percentage: 15 },
      { decade: "2000s", count: 4, percentage: 7 },
    ],
    artistDiversityHHI: 0.052,
    duplicates: [],
    tracks: Array.from({ length: 18 }, (_, i) => ({
      id: `anadolu-track-${i + 1}`,
      name: [
        "Gülpembe", "Resimdeki Gözyaşları", "Fesupanallah", "Dönence", "Tamirci Çırağı",
        "Çöpçüler", "Kara Sevda", "Islak Islak", "Öyle Bir Geçer Zaman Ki", "Şaşkın",
        "Namus Belası", "Anlasana", "Dağlar Dağlar", "Ceviz Ağacı", "Yalnızlar Rıhtımı",
        "Sarı Çizmeli Mehmet Ağa", "Deniz Üstü Köpürür", "Unutamadım"
      ][i],
      artists: [{ name: ["Barış Manço", "Cem Karaca", "Erkin Koray", "Barış Manço", "Cem Karaca", "Erkin Koray", "Barış Manço", "Cem Karaca", "Erkin Koray", "Erkin Koray", "Cem Karaca", "Haluk Levent", "Barış Manço", "Cem Karaca", "Erkin Koray", "Barış Manço", "Cem Karaca", "Barış Manço"][i] }],
      albumName: `Anadolu Klasikleri ${i + 1}`,
      albumCover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80",
      durationMs: 270000 + (i * 2000),
      popularity: 72 - (i % 6),
      releaseDate: i < 10 ? "1978-04-10" : "1985-06-20",
      explicit: false,
      audioFeatures: {
        energy: 0.62 + (i % 10) / 100,
        danceability: 0.55 + (i % 8) / 100,
        valence: 0.60 + (i % 12) / 100,
        acousticness: 0.32,
        instrumentalness: 0.15,
        liveness: 0.20,
        speechiness: 0.05,
        tempo: 110 + (i * 3) % 22,
        loudness: -7.2,
        key: (i * 4) % 12,
        mode: 0,
      },
    })),
  },
  "deep-house": {
    id: "37i9dQZF1DX8tZfvP7v82A",
    title: "Deep House & Ibiza Sunset Lounge",
    description: "Atmospheric deep house grooves, melodic techno, and sunset beach lounge beats.",
    ownerName: "Ibiza Sound System",
    ownerId: "ibizasound",
    followers: 1420500,
    coverArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    dominantColor: "#06b6d4",
    totalTracks: 40,
    totalDurationSeconds: 12400,
    uniqueArtistsCount: 28,
    uniqueAlbumsCount: 35,
    explicitTrackCount: 0,
    averagePopularity: 74,
    qualityScore: 95,
    riskLevel: "safe",
    botFlags: {
      artistStuffing: false,
      shortDurationAnomaly: false,
      bimodalPopularityAnomaly: false,
      duplicateTracksCount: 0,
    },
    pitchingVerdict: "Akdeniz kulüp ve beach club dinleyici kitlesine hitap eden, harmonik geçişli ve %100 organik elektronik liste.",
    audioFeaturesSummary: {
      avgEnergy: 0.76,
      avgDanceability: 0.78,
      avgValence: 0.58,
      avgAcousticness: 0.08,
      avgInstrumentalness: 0.72,
      avgLiveness: 0.13,
      avgSpeechiness: 0.06,
      avgTempo: 124,
      medianTempo: 124,
      avgLoudness: -6.5,
    },
    dominantMood: {
      tag: "party",
      labelTr: "Deep House & Ibiza Sunset",
      labelEn: "Deep House & Ibiza Sunset",
      descriptionTr: "Melodik synth katmanları, 4/4 vuruşlu ritimler ve plaj kulübü atmosferi.",
      descriptionEn: "Melodic synth layers, driving 4/4 beats, and sunset beach lounge vibes.",
    },
    topGenres: [
      { genre: "Deep House", count: 22, percentage: 55 },
      { genre: "Melodic Techno", count: 12, percentage: 30 },
      { genre: "Organic House", count: 6, percentage: 15 },
    ],
    keyDistribution: [
      { keyName: "A Minör", camelot: "8A", count: 10, percentage: 25 },
      { keyName: "F Minör", camelot: "4A", count: 8, percentage: 20 },
      { keyName: "D Minör", camelot: "7A", count: 7, percentage: 18 },
      { keyName: "C Minör", camelot: "5A", count: 6, percentage: 15 },
      { keyName: "Diğer Tonlar", camelot: "Var", count: 9, percentage: 22 },
    ],
    decadeDistribution: [
      { decade: "2020s", count: 32, percentage: 80 },
      { decade: "2010s", count: 8, percentage: 20 },
    ],
    artistDiversityHHI: 0.038,
    duplicates: [],
    tracks: Array.from({ length: 15 }, (_, i) => ({
      id: `house-track-${i + 1}`,
      name: [
        "Finder", "Opus", "Cola", "Complicity", "Sun My Sweet Sun",
        "Make Luv", "Generate", "Keta", "Breathe", "Losing It",
        "Spatial", "Reflections", "Sonnentanz", "Marea (We've Lost Dancing)", "Miracle"
      ][i],
      artists: [{ name: ["Ninetoes", "Eric Prydz", "CamelPhat", "Monolink", "Nora En Pure", "Solomun", "Keinemusik", "Ben Böhmer", "Telepopmusik", "FISHER"][i % 10] }],
      albumName: `Ibiza Deep House Vol. ${i + 1}`,
      albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      durationMs: 310000 + (i * 3000),
      popularity: 76 - (i % 6),
      releaseDate: "2023-07-20",
      explicit: false,
      audioFeatures: {
        energy: 0.74 + (i % 10) / 100,
        danceability: 0.76 + (i % 8) / 100,
        valence: 0.55 + (i % 12) / 100,
        acousticness: 0.06,
        instrumentalness: 0.75,
        liveness: 0.12,
        speechiness: 0.05,
        tempo: 122 + (i * 2) % 6,
        loudness: -6.4,
        key: (i * 3) % 12,
        mode: 0,
      },
    })),
  },
  "acoustic-indie": {
    id: "37i9dQZF1DX2Nc3B70tvx0",
    title: "Acoustic Indie & Warm Folk Discoveries",
    description: "Raw acoustic guitars, poetic songwriting, and intimate indie folk sessions.",
    ownerName: "Indie Folk Central",
    ownerId: "indiefolk",
    followers: 820300,
    coverArtUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    dominantColor: "#3b82f6",
    totalTracks: 42,
    totalDurationSeconds: 9660,
    uniqueArtistsCount: 35,
    uniqueAlbumsCount: 40,
    explicitTrackCount: 2,
    averagePopularity: 65,
    qualityScore: 97,
    riskLevel: "safe",
    botFlags: {
      artistStuffing: false,
      shortDurationAnomaly: false,
      bimodalPopularityAnomaly: false,
      duplicateTracksCount: 0,
    },
    pitchingVerdict: "Akustik enstrümantasyona, bağımsız organik keşif kitlesine ve sıfır sahtecilik riskine sahip indie müzik listesi.",
    audioFeaturesSummary: {
      avgEnergy: 0.38,
      avgDanceability: 0.52,
      avgValence: 0.46,
      avgAcousticness: 0.82,
      avgInstrumentalness: 0.25,
      avgLiveness: 0.14,
      avgSpeechiness: 0.04,
      avgTempo: 104,
      medianTempo: 102,
      avgLoudness: -10.5,
    },
    dominantMood: {
      tag: "melancholic",
      labelTr: "Akustik Indie & Sıcak Folk",
      labelEn: "Acoustic Indie & Warm Folk",
      descriptionTr: "Organik gitar telleri, samimi vokal harmonileri ve huzurlu atmosfer.",
      descriptionEn: "Raw acoustic strings, intimate vocal harmonies, and warm organic folk sounds.",
    },
    topGenres: [
      { genre: "Indie Folk", count: 24, percentage: 57 },
      { genre: "Acoustic Pop", count: 12, percentage: 29 },
      { genre: "Stomp and Holler", count: 6, percentage: 14 },
    ],
    keyDistribution: [
      { keyName: "G Majör", camelot: "9B", count: 12, percentage: 29 },
      { keyName: "C Majör", camelot: "8B", count: 10, percentage: 24 },
      { keyName: "D Majör", camelot: "10B", count: 8, percentage: 19 },
      { keyName: "E Minör", camelot: "9A", count: 6, percentage: 14 },
      { keyName: "Diğer Tonlar", camelot: "Var", count: 6, percentage: 14 },
    ],
    decadeDistribution: [
      { decade: "2020s", count: 30, percentage: 71 },
      { decade: "2010s", count: 12, percentage: 29 },
    ],
    artistDiversityHHI: 0.029,
    duplicates: [],
    tracks: Array.from({ length: 15 }, (_, i) => ({
      id: `indie-track-${i + 1}`,
      name: [
        "Ho Hey", "Skinny Love", "The Cave", "Holocene", "Little Talks",
        "Ophelia", "Riptide", "Stubborn Love", "Rivers and Roads", "Bloom",
        "Cleopatra", "Follow the Sun", "Mess Is Mine", "First Day of My Life", "Fast Car"
      ][i],
      artists: [{ name: ["The Lumineers", "Bon Iver", "Mumford & Sons", "Vance Joy", "Of Monsters and Men", "Xavier Rudd", "Bright Eyes", "Ben Howard", "Iron & Wine", "Gregory Alan Isakov"][i % 10] }],
      albumName: `Indie Acoustic Vol. ${i + 1}`,
      albumCover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
      durationMs: 210000 + (i * 2500),
      popularity: 68 - (i % 5),
      releaseDate: "2022-09-15",
      explicit: false,
      audioFeatures: {
        energy: 0.35 + (i % 10) / 100,
        danceability: 0.50 + (i % 8) / 100,
        valence: 0.42 + (i % 12) / 100,
        acousticness: 0.80 + (i % 15) / 100,
        instrumentalness: 0.20,
        liveness: 0.12,
        speechiness: 0.04,
        tempo: 98 + (i * 2) % 18,
        loudness: -11.0,
        key: (i * 2) % 12,
        mode: 1,
      },
    })),
  },
};

export const DEMO_PROFILES: Record<string, SpotifyProfileAnalysis> = {
  "daft-punk": {
    id: "4tZ12WiiJrAcoLv0vCgW4j",
    type: "artist",
    name: "Daft Punk",
    avatarUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
    followers: 12450800,
    popularity: 88,
    verified: true,
    bio: "Legendary French electronic music duo consisting of Thomas Bangalter and Guy-Manuel de Homem-Christo.",
    genres: ["filter house", "electro", "synthpop", "french touch"],
    totalFollowerReach: 18500000,
    publicPlaylists: [
      { id: "dp-pl-1", title: "Daft Punk Complete Collection", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300", tracksCount: 85, followersCount: 420000 },
      { id: "dp-pl-2", title: "Daft Punk Influences & Samples", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300", tracksCount: 120, followersCount: 180000 },
    ],
    topTracks: [
      {
        id: "dp-1",
        name: "One More Time",
        artists: [{ name: "Daft Punk" }],
        albumName: "Discovery",
        albumCover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
        durationMs: 320000,
        popularity: 88,
        releaseDate: "2001-03-12",
        explicit: false,
        audioFeatures: { energy: 0.88, danceability: 0.78, valence: 0.92, acousticness: 0.02, instrumentalness: 0.35, liveness: 0.15, speechiness: 0.06, tempo: 123, loudness: -4.5, key: 2, mode: 1 },
      },
      {
        id: "dp-2",
        name: "Get Lucky (feat. Pharrell Williams & Nile Rodgers)",
        artists: [{ name: "Daft Punk" }, { name: "Pharrell Williams" }, { name: "Nile Rodgers" }],
        albumName: "Random Access Memories",
        albumCover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
        durationMs: 248000,
        popularity: 90,
        releaseDate: "2013-05-17",
        explicit: false,
        audioFeatures: { energy: 0.81, danceability: 0.79, valence: 0.86, acousticness: 0.04, instrumentalness: 0.01, liveness: 0.10, speechiness: 0.07, tempo: 116, loudness: -5.2, key: 6, mode: 0 },
      },
      {
        id: "dp-3",
        name: "Around the World",
        artists: [{ name: "Daft Punk" }],
        albumName: "Homework",
        albumCover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
        durationMs: 429000,
        popularity: 84,
        releaseDate: "1997-01-20",
        explicit: false,
        audioFeatures: { energy: 0.91, danceability: 0.92, valence: 0.84, acousticness: 0.01, instrumentalness: 0.82, liveness: 0.08, speechiness: 0.05, tempo: 121, loudness: -5.8, key: 7, mode: 1 },
      },
      {
        id: "dp-4",
        name: "Harder, Better, Faster, Stronger",
        artists: [{ name: "Daft Punk" }],
        albumName: "Discovery",
        albumCover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
        durationMs: 224000,
        popularity: 85,
        releaseDate: "2001-03-12",
        explicit: false,
        audioFeatures: { energy: 0.74, danceability: 0.82, valence: 0.71, acousticness: 0.03, instrumentalness: 0.12, liveness: 0.22, speechiness: 0.14, tempo: 123, loudness: -6.1, key: 6, mode: 0 },
      },
      {
        id: "dp-5",
        name: "Instant Crush (feat. Julian Casablancas)",
        artists: [{ name: "Daft Punk" }, { name: "Julian Casablancas" }],
        albumName: "Random Access Memories",
        albumCover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
        durationMs: 337000,
        popularity: 87,
        releaseDate: "2013-05-17",
        explicit: false,
        audioFeatures: { energy: 0.60, danceability: 0.58, valence: 0.52, acousticness: 0.04, instrumentalness: 0.62, liveness: 0.11, speechiness: 0.04, tempo: 110, loudness: -7.8, key: 1, mode: 0 },
      },
    ],
    discography: [
      { id: "disc-1", title: "Random Access Memories", releaseDate: "2013", type: "album", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300", totalTracks: 13 },
      { id: "disc-2", title: "Human After All", releaseDate: "2005", type: "album", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300", totalTracks: 10 },
      { id: "disc-3", title: "Discovery", releaseDate: "2001", type: "album", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300", totalTracks: 14 },
      { id: "disc-4", title: "Homework", releaseDate: "1997", type: "album", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300", totalTracks: 16 },
    ],
  },
  "the-weeknd": {
    id: "1Xyo4u8uXC1ZmMpatF05PJ",
    type: "artist",
    name: "The Weeknd",
    avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    followers: 84200000,
    popularity: 96,
    verified: true,
    bio: "Canadian singer, songwriter, and record producer known for sonic versatility and dark R&B/pop aesthetics.",
    genres: ["canadian pop", "pop", "canadian r&b"],
    totalFollowerReach: 120000000,
    publicPlaylists: [
      { id: "tw-pl-1", title: "The Weeknd: Complete Discography", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300", tracksCount: 110, followersCount: 1450000 },
      { id: "tw-pl-2", title: "After Hours & Dawn FM Era", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300", tracksCount: 45, followersCount: 890000 },
    ],
    topTracks: [
      {
        id: "tw-1",
        name: "Blinding Lights",
        artists: [{ name: "The Weeknd" }],
        albumName: "After Hours",
        albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
        durationMs: 200000,
        popularity: 95,
        releaseDate: "2020-03-20",
        explicit: false,
        audioFeatures: { energy: 0.73, danceability: 0.51, valence: 0.33, acousticness: 0.00, instrumentalness: 0.00, liveness: 0.09, speechiness: 0.06, tempo: 171, loudness: -5.9, key: 1, mode: 1 },
      },
      {
        id: "tw-2",
        name: "Starboy (feat. Daft Punk)",
        artists: [{ name: "The Weeknd" }, { name: "Daft Punk" }],
        albumName: "Starboy",
        albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
        durationMs: 230000,
        popularity: 94,
        releaseDate: "2016-11-25",
        explicit: true,
        audioFeatures: { energy: 0.58, danceability: 0.67, valence: 0.48, acousticness: 0.14, instrumentalness: 0.00, liveness: 0.13, speechiness: 0.27, tempo: 186, loudness: -7.0, key: 7, mode: 0 },
      },
      {
        id: "tw-3",
        name: "Save Your Tears",
        artists: [{ name: "The Weeknd" }],
        albumName: "After Hours",
        albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
        durationMs: 215000,
        popularity: 92,
        releaseDate: "2020-03-20",
        explicit: false,
        audioFeatures: { energy: 0.82, danceability: 0.68, valence: 0.64, acousticness: 0.02, instrumentalness: 0.00, liveness: 0.54, speechiness: 0.03, tempo: 118, loudness: -5.4, key: 0, mode: 1 },
      },
      {
        id: "tw-4",
        name: "The Hills",
        artists: [{ name: "The Weeknd" }],
        albumName: "Beauty Behind The Madness",
        albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
        durationMs: 242000,
        popularity: 90,
        releaseDate: "2015-08-28",
        explicit: true,
        audioFeatures: { energy: 0.56, danceability: 0.58, valence: 0.13, acousticness: 0.07, instrumentalness: 0.00, liveness: 0.12, speechiness: 0.05, tempo: 113, loudness: -7.0, key: 0, mode: 0 },
      },
    ],
    discography: [
      { id: "tw-disc-1", title: "Dawn FM", releaseDate: "2022", type: "album", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300", totalTracks: 16 },
      { id: "tw-disc-2", title: "After Hours", releaseDate: "2020", type: "album", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300", totalTracks: 14 },
      { id: "tw-disc-3", title: "Starboy", releaseDate: "2016", type: "album", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300", totalTracks: 18 },
      { id: "tw-disc-4", title: "Beauty Behind The Madness", releaseDate: "2015", type: "album", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300", totalTracks: 14 },
    ],
  },
};
