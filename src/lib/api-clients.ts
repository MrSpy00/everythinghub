/**
 * EverythingHub Zero-Auth API Clients
 * 100% Free, Public, Zero-Auth & Resilient Open Data Services
 */

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: {
    temperature: number;
    weatherCode: number;
    weatherDescription: string;
    windSpeed: number;
    windDirection: number;
    relativeHumidity: number;
    apparentTemperature: number;
    uvIndex: number;
    isDay: boolean;
  };
  hourly: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
    uvIndexMax: number[];
    sunrise: string[];
    sunset: string[];
  };
  airQuality?: {
    pm2_5: number;
    pm10: number;
    europeanAqi: number;
    qualityLabel: string;
  };
}

export interface CountryData {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  population: number;
  area: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  timezones: string[];
  continents: string[];
  borders?: string[];
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
}

export interface CryptoAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  vwap24Hr?: string;
}

export interface BookSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  publisher?: string[];
  number_of_pages_median?: number;
  language?: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
}

export interface DatamuseWord {
  word: string;
  score: number;
  numSyllables?: number;
  defs?: string[];
}

export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
}

// Weather Code mapping to human readable text and Lucide icon names
export function getWeatherCodeInfo(code: number): { label: string; icon: string; mood: string } {
  if (code === 0) return { label: "Açık ve Güneşli", icon: "Sun", mood: "from-amber-500/20 to-orange-500/20" };
  if (code === 1) return { label: "Çoğunlukla Açık", icon: "SunMedium", mood: "from-amber-400/20 to-yellow-500/20" };
  if (code === 2) return { label: "Parçalı Bulutlu", icon: "CloudSun", mood: "from-blue-400/20 to-cyan-500/20" };
  if (code === 3) return { label: "Kapalı / Bulutlu", icon: "Cloud", mood: "from-zinc-500/20 to-slate-600/20" };
  if (code >= 45 && code <= 48) return { label: "Sisli ve Puslu", icon: "CloudFog", mood: "from-slate-500/20 to-zinc-600/20" };
  if (code >= 51 && code <= 55) return { label: "Hafif Çisenti", icon: "CloudDrizzle", mood: "from-cyan-500/20 to-blue-600/20" };
  if (code >= 61 && code <= 65) return { label: "Yağmurlu", icon: "CloudRain", mood: "from-blue-500/20 to-indigo-600/20" };
  if (code >= 71 && code <= 77) return { label: "Kar Yağışlı", icon: "CloudSnow", mood: "from-sky-300/20 to-indigo-400/20" };
  if (code >= 80 && code <= 82) return { label: "Şiddetli Sağanak", icon: "CloudRainWind", mood: "from-indigo-600/20 to-purple-700/20" };
  if (code >= 95 && code <= 99) return { label: "Gök Gürültülü Fırtına", icon: "CloudLightning", mood: "from-purple-600/20 to-pink-700/20" };
  return { label: "Bulutlu", icon: "Cloud", mood: "from-zinc-500/20 to-slate-600/20" };
}

export function getAirQualityLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: "Çok İyi / Mükemmel", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (aqi <= 40) return { label: "İyi / Temiz", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
  if (aqi <= 60) return { label: "Orta Düzey", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  if (aqi <= 80) return { label: "Hassas Gruplar İçin Riskli", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
  if (aqi <= 100) return { label: "Sağlıksız / Kirli", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  return { label: "Çok Tehlikeli / Ağır Kirlilik", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
}

/**
 * Open-Meteo Weather & Air Quality API Client
 */
export async function fetchLiveWeather(lat: number, lon: number, cityName = "Konumunuz", country = "TR"): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto`;
  
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi&timezone=auto`;

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(weatherUrl).then((r) => r.json()),
    fetch(aqiUrl).then((r) => r.json()).catch(() => null),
  ]);

  const current = weatherRes.current || {};
  const weatherCode = current.weather_code ?? 0;
  const weatherInfo = getWeatherCodeInfo(weatherCode);

  let airQuality;
  if (aqiRes && aqiRes.current) {
    const aqiVal = aqiRes.current.european_aqi ?? 25;
    airQuality = {
      pm2_5: aqiRes.current.pm2_5 ?? 0,
      pm10: aqiRes.current.pm10 ?? 0,
      europeanAqi: aqiVal,
      qualityLabel: getAirQualityLabel(aqiVal).label,
    };
  }

  return {
    city: cityName,
    country,
    latitude: lat,
    longitude: lon,
    current: {
      temperature: Math.round(current.temperature_2m ?? 20),
      weatherCode,
      weatherDescription: weatherInfo.label,
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      windDirection: current.wind_direction_10m ?? 0,
      relativeHumidity: current.relative_humidity_2m ?? 50,
      apparentTemperature: Math.round(current.apparent_temperature ?? 20),
      uvIndex: Math.round((current.uv_index ?? 2) * 10) / 10,
      isDay: Boolean(current.is_day),
    },
    hourly: {
      time: (weatherRes.hourly?.time || []).slice(0, 24),
      temperature: (weatherRes.hourly?.temperature_2m || []).slice(0, 24),
      precipitationProbability: (weatherRes.hourly?.precipitation_probability || []).slice(0, 24),
      weatherCode: (weatherRes.hourly?.weather_code || []).slice(0, 24),
    },
    daily: {
      time: weatherRes.daily?.time || [],
      temperatureMax: weatherRes.daily?.temperature_2m_max || [],
      temperatureMin: weatherRes.daily?.temperature_2m_min || [],
      weatherCode: weatherRes.daily?.weather_code || [],
      uvIndexMax: weatherRes.daily?.uv_index_max || [],
      sunrise: weatherRes.daily?.sunrise || [],
      sunset: weatherRes.daily?.sunset || [],
    },
    airQuality,
  };
}

/**
 * Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<Array<{ name: string; country: string; admin1?: string; latitude: number; longitude: number; country_code: string }>> {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=tr&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((item: any) => ({
    name: item.name,
    country: item.country || "",
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    country_code: item.country_code || "TR",
  }));
}

/**
 * REST Countries API Client
 */
export async function fetchAllCountries(): Promise<CountryData[]> {
  const url = "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,languages,currencies,population,area,flags,timezones,continents,borders,maps";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Ülke verileri alınamadı.");
  const data: CountryData[] = await res.json();
  return data.sort((a, b) => a.name.common.localeCompare(b.name.common));
}

/**
 * CoinCap Public Crypto Assets API
 */
export async function fetchTopCryptos(limit = 50): Promise<CryptoAsset[]> {
  try {
    const res = await fetch(`https://api.coincap.io/v2/assets?limit=${limit}`);
    if (!res.ok) throw new Error("CoinCap API başarısız");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    // Fallback to Binance Ticker
    const binanceRes = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    if (!binanceRes.ok) return [];
    const list = await binanceRes.json();
    const usdtPairs = (list || [])
      .filter((item: any) => item.symbol.endsWith("USDT"))
      .slice(0, limit)
      .map((item: any, idx: number) => ({
        id: item.symbol.toLowerCase(),
        rank: String(idx + 1),
        symbol: item.symbol.replace("USDT", ""),
        name: item.symbol.replace("USDT", ""),
        priceUsd: item.lastPrice,
        changePercent24Hr: item.priceChangePercent,
        marketCapUsd: String(parseFloat(item.quoteVolume) * parseFloat(item.lastPrice)),
        volumeUsd24Hr: item.quoteVolume,
      }));
    return usdtPairs;
  }
}

/**
 * Open Library Book & ISBN Search
 */
export async function searchOpenLibrary(query: string, type: "title" | "author" | "isbn" = "title"): Promise<BookSearchResult[]> {
  let param = `q=${encodeURIComponent(query)}`;
  if (type === "title") param = `title=${encodeURIComponent(query)}`;
  if (type === "author") param = `author=${encodeURIComponent(query)}`;
  if (type === "isbn") param = `isbn=${encodeURIComponent(query)}`;

  const url = `https://openlibrary.org/search.json?${param}&limit=20`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.docs || []).map((doc: any) => ({
    key: doc.key,
    title: doc.title,
    author_name: doc.author_name,
    first_publish_year: doc.first_publish_year,
    isbn: doc.isbn,
    cover_i: doc.cover_i,
    publisher: doc.publisher,
    number_of_pages_median: doc.number_of_pages_median,
    language: doc.language,
  }));
}

/**
 * Free Dictionary API
 */
export async function fetchDictionaryWord(word: string): Promise<DictionaryEntry | null> {
  if (!word.trim()) return null;
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

/**
 * Datamuse Words API (Synonyms, Rhymes, Triggers)
 */
export async function fetchDatamuseWords(word: string, mode: "rhyme" | "synonym" | "related" = "synonym"): Promise<DatamuseWord[]> {
  if (!word.trim()) return [];
  let param = `rel_syn=${encodeURIComponent(word)}`;
  if (mode === "rhyme") param = `rel_rhy=${encodeURIComponent(word)}`;
  if (mode === "related") param = `rel_trg=${encodeURIComponent(word)}`;

  const res = await fetch(`https://api.datamuse.com/words?${param}&max=25&md=d`);
  if (!res.ok) return [];
  return res.json();
}

/**
 * Open Trivia Database API
 */
export async function fetchTriviaQuestions(amount = 10, category = "", difficulty = ""): Promise<TriviaQuestion[]> {
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  
  return (data.results || []).map((q: any) => {
    // Decode HTML entities
    const decodeHtml = (html: string) => {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    };

    const question = decodeHtml(q.question);
    const correct = decodeHtml(q.correct_answer);
    const incorrect = (q.incorrect_answers || []).map(decodeHtml);
    const all = [...incorrect, correct].sort(() => Math.random() - 0.5);

    return {
      category: q.category,
      type: q.type,
      difficulty: q.difficulty,
      question,
      correct_answer: correct,
      incorrect_answers: incorrect,
      all_answers: all,
    };
  });
}
