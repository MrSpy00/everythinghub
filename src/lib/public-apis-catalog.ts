/**
 * EverythingHub Hand-Curated Zero-Auth Public APIs Catalog
 * Inspired by freeapi.app, public-apis/public-apis & apipheny.io
 */

export interface PublicAPIItem {
  id: string;
  name: string;
  category: "weather" | "crypto" | "finance" | "animals" | "facts" | "dictionary" | "countries" | "books" | "space" | "dev";
  description: string;
  method: "GET" | "POST";
  endpoint: string;
  cors: boolean;
  https: boolean;
  sampleHeaders?: Record<string, string>;
  sampleParams?: Record<string, string>;
  sampleBody?: string;
  docsUrl: string;
  badgeColor: string;
}

export const PUBLIC_APIS_CATALOG: PublicAPIItem[] = [
  // 1. Weather & Environment
  {
    id: "open-meteo-forecast",
    name: "Open-Meteo Weather Forecast",
    category: "weather",
    description: "Dünya genelinde saatlik ve 7 günlük sıcaklık, nem, rüzgar ve UV indeksi.",
    method: "GET",
    endpoint: "https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability",
    cors: true,
    https: true,
    docsUrl: "https://open-meteo.com/en/docs",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "open-meteo-aqi",
    name: "Open-Meteo Air Quality Index (AQI)",
    category: "weather",
    description: "PM2.5, PM10, Ozon ve Avrupa Hava Kalitesi İndeksi canlı değerleri.",
    method: "GET",
    endpoint: "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=41.0082&longitude=28.9784&current=pm10,pm2_5,european_aqi",
    cors: true,
    https: true,
    docsUrl: "https://open-meteo.com/en/docs/air-quality-api",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "sunrise-sunset",
    name: "Sunrise & Sunset Times",
    category: "weather",
    description: "Gün doğumu, gün batımı, sivil ve astronomik alacakaranlık süreleri.",
    method: "GET",
    endpoint: "https://api.sunrise-sunset.org/json?lat=41.0082&lng=28.9784&formatted=0",
    cors: true,
    https: true,
    docsUrl: "https://sunrise-sunset.org/api",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },

  // 2. Crypto & Web3
  {
    id: "coincap-assets",
    name: "CoinCap Crypto Top Assets",
    category: "crypto",
    description: "En popüler 100 kripto paranın canlı fiyatı, piyasa değeri ve 24s hacmi.",
    method: "GET",
    endpoint: "https://api.coincap.io/v2/assets?limit=10",
    cors: true,
    https: true,
    docsUrl: "https://docs.coincap.io/",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "binance-24hr-ticker",
    name: "Binance Public 24h Ticker",
    category: "crypto",
    description: "Binance spot piyasasında BTC/USDT 24 saatlik fiyat değişimi ve hacmi.",
    method: "GET",
    endpoint: "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT",
    cors: true,
    https: true,
    docsUrl: "https://binance-docs.github.io/apidocs/spot/en/",
    badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  },

  // 3. Finance & Currency
  {
    id: "frankfurter-latest",
    name: "Frankfurter ECB Currency Exchange",
    category: "finance",
    description: "Avrupa Merkez Bankası (ECB) günlük resmi döviz kurları (USD, EUR, TRY).",
    method: "GET",
    endpoint: "https://api.frankfurter.app/latest?from=USD&to=EUR,TRY,GBP,JPY",
    cors: true,
    https: true,
    docsUrl: "https://www.frankfurter.app/docs/",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "open-er-api",
    name: "Open Exchange Rates Free Feeds",
    category: "finance",
    description: "160+ fiat para biriminin anlık çapraz kur değerleri.",
    method: "GET",
    endpoint: "https://open.er-api.com/v6/latest/USD",
    cors: true,
    https: true,
    docsUrl: "https://www.exchangerate-api.com/docs/free",
    badgeColor: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  },

  // 4. Countries & Geography
  {
    id: "rest-countries-all",
    name: "REST Countries Full Database",
    category: "countries",
    description: "250+ dünya ülkesinin bayrakları, nüfusu, başkenti, dilleri ve sınırları.",
    method: "GET",
    endpoint: "https://restcountries.com/v3.1/name/turkey?fields=name,capital,currencies,population,flags,languages,timezones",
    cors: true,
    https: true,
    docsUrl: "https://restcountries.com/",
    badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  },
  {
    id: "universities-search",
    name: "HipoLabs World Universities",
    category: "countries",
    description: "Ülke bazında listelenen 10.000+ dünya üniversitesi ve web siteleri.",
    method: "GET",
    endpoint: "https://universities.hipolabs.com/search?country=Turkey",
    cors: true,
    https: true,
    docsUrl: "https://github.com/Hipo/university-domains-list",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },

  // 5. Books & Culture
  {
    id: "open-library-search",
    name: "Open Library Book Search",
    category: "books",
    description: "20 milyondan fazla kitap, yazar, ISBN ve yayıncı araması.",
    method: "GET",
    endpoint: "https://openlibrary.org/search.json?title=the+lord+of+the+rings&limit=5",
    cors: true,
    https: true,
    docsUrl: "https://openlibrary.org/developers/api",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },

  // 6. Dictionaries & Linguistics
  {
    id: "free-dictionary-en",
    name: "Free Dictionary English API",
    category: "dictionary",
    description: "İngilizce kelimelerin fonetik telaffuz sesi, tanımları, eş ve zıt anlamları.",
    method: "GET",
    endpoint: "https://api.dictionaryapi.dev/api/v2/entries/en/serendipity",
    cors: true,
    https: true,
    docsUrl: "https://dictionaryapi.dev/",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "datamuse-rhymes",
    name: "Datamuse Rhymes & Synonyms",
    category: "dictionary",
    description: "Kafiyeli kelimeler (rhymes), eşanlamlılar ve sıfat tamlamaları motoru.",
    method: "GET",
    endpoint: "https://api.datamuse.com/words?rel_syn=brilliant&max=10",
    cors: true,
    https: true,
    docsUrl: "https://www.datamuse.com/api/",
    badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  },

  // 7. Space & Science
  {
    id: "nasa-apod",
    name: "NASA Astronomy Picture of the Day",
    category: "space",
    description: "NASA tarafından yayınlanan günlük HD uzay fotoğrafı ve bilimsel açıklaması.",
    method: "GET",
    endpoint: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
    cors: true,
    https: true,
    docsUrl: "https://api.nasa.gov/",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },

  // 8. Trivia & Facts
  {
    id: "open-trivia-db",
    name: "Open Trivia Database",
    category: "facts",
    description: "24 kategoride genel kültür, bilim, tarih ve bilgisayar çoktan seçmeli soruları.",
    method: "GET",
    endpoint: "https://opentdb.com/api.php?amount=5&category=18&type=multiple",
    cors: true,
    https: true,
    docsUrl: "https://opentdb.com/api_config.php",
    badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  },
  {
    id: "useless-facts",
    name: "Useless Facts API",
    category: "facts",
    description: "Rastgele ilginç ve sıradışı doğrulanmış gerçekler ve ansiklopedik bilgiler.",
    method: "GET",
    endpoint: "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
    cors: true,
    https: true,
    docsUrl: "https://uselessfacts.jsph.pl/",
    badgeColor: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
  },

  // 9. Animals & Nature
  {
    id: "dog-api-random",
    name: "Dog CEO Dog Pictures",
    category: "animals",
    description: "Köpek ırkları ve yüksek çözünürlüklü köpek fotoğrafları API'si.",
    method: "GET",
    endpoint: "https://dog.ceo/api/breeds/image/random",
    cors: true,
    https: true,
    docsUrl: "https://dog.ceo/dog-api/",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "cat-facts-api",
    name: "Cat Facts API",
    category: "animals",
    description: "Kediler hakkında doğrulanmış ilginç bilimsel bilgiler.",
    method: "GET",
    endpoint: "https://catfact.ninja/fact",
    cors: true,
    https: true,
    docsUrl: "https://catfact.ninja/",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },

  // 10. Developer & Testing (FreeAPI.app & JSONPlaceholder style)
  {
    id: "jsonplaceholder-posts",
    name: "JSONPlaceholder Fake REST API",
    category: "dev",
    description: "Frontend prototipleme ve testler için 100 sahte blog gönderisi ve yorumları.",
    method: "GET",
    endpoint: "https://jsonplaceholder.typicode.com/posts/1",
    cors: true,
    https: true,
    docsUrl: "https://jsonplaceholder.typicode.com/",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "reqres-users",
    name: "ReqRes Hosted REST Sandbox",
    category: "dev",
    description: "Sayfalanmış sahte kullanıcı listesi ve avatar görselleri.",
    method: "GET",
    endpoint: "https://reqres.in/api/users?page=1",
    cors: true,
    https: true,
    docsUrl: "https://reqres.in/",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "randomuser-me",
    name: "RandomUser Identity Generator",
    category: "dev",
    description: "Tamamen rastgele isim, adres, e-posta ve yüksek kaliteli profil avatarları.",
    method: "GET",
    endpoint: "https://randomuser.me/api/?results=3",
    cors: true,
    https: true,
    docsUrl: "https://randomuser.me/",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "cloudflare-trace",
    name: "Cloudflare Network Trace",
    category: "dev",
    description: "Bağlantı IP adresi, Cloudflare datacenter lokasyonu (colo), HTTP ve TLS sürümü.",
    method: "GET",
    endpoint: "https://1.1.1.1/cdn-cgi/trace",
    cors: true,
    https: true,
    docsUrl: "https://developers.cloudflare.com/",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
];
