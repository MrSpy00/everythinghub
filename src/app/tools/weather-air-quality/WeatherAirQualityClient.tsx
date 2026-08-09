"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  Search,
  Activity,
  Navigation,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fetchLiveWeather, searchCities, type WeatherData } from "@/lib/api-clients";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { HorizontalScrollContainer } from "@/components/shared/HorizontalScrollContainer";

const POPULAR_CITIES = [
  { name: "İstanbul", lat: 41.0082, lon: 28.9784, country: "TR" },
  { name: "Ankara", lat: 39.9334, lon: 32.8597, country: "TR" },
  { name: "İzmir", lat: 38.4192, lon: 27.1287, country: "TR" },
  { name: "Antalya", lat: 36.8969, lon: 30.7133, country: "TR" },
  { name: "Bursa", lat: 40.1885, lon: 29.0610, country: "TR" },
  { name: "London", lat: 51.5074, lon: -0.1278, country: "GB" },
  { name: "New York", lat: 40.7128, lon: -74.0060, country: "US" },
  { name: "Berlin", lat: 52.5200, lon: 13.4050, country: "DE" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "JP" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, country: "AE" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "FR" },
];

export function WeatherAirQualityClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [query, setQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Array<any>>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoDetecting, setGeoDetecting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadWeather = useCallback(
    async (lat: number, lon: number, cityName = "İstanbul", country = "TR") => {
      setLoading(true);
      try {
        const data = await fetchLiveWeather(lat, lon, cityName, country);
        setWeather(data);
        // Persist to local storage
        try {
          localStorage.setItem(
            "everythinghub_last_weather_loc",
            JSON.stringify({ lat, lon, cityName, country })
          );
        } catch {}
      } catch {
        toast.error(isTurkish ? "Hava durumu verisi alınamadı." : "Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    },
    [isTurkish]
  );

  // Restore saved location or load Istanbul default
  useEffect(() => {
    try {
      const saved = localStorage.getItem("everythinghub_last_weather_loc");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lon) {
          loadWeather(parsed.lat, parsed.lon, parsed.cityName || "İstanbul", parsed.country || "TR");
          return;
        }
      }
    } catch {}
    loadWeather(41.0082, 28.9784, "İstanbul", "TR");
  }, [loadWeather]);

  const handleCitySearch = (val: string) => {
    setQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchCities(val);
        setCitySuggestions(results);
      }, 250);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSelectCity = (city: any) => {
    setCitySuggestions([]);
    setQuery(`${city.name}, ${city.country}`);
    loadWeather(city.latitude, city.longitude, city.name, city.country);
    toast.success(isTurkish ? `${city.name} hava durumu yüklendi!` : `${city.name} weather loaded!`);
  };

  // Ultra-Fast High-Accuracy Geolocation with Instant IP Fallback
  const handleUseCurrentLocation = async () => {
    if (geoDetecting) return;
    setGeoDetecting(true);
    const toastId = toast.loading(isTurkish ? "Konumunuz tespit ediliyor..." : "Detecting location...", { id: "geo" });

    let resolved = false;

    // Fast IP-based geo fallback function
    const fallbackToIP = async () => {
      if (resolved) return;
      try {
        const ipRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            resolved = true;
            toast.dismiss(toastId);
            setGeoDetecting(false);
            const city = ipData.city || "Konumunuz";
            loadWeather(ipData.latitude, ipData.longitude, city, ipData.country_code || "TR");
            toast.success(isTurkish ? `${city} konumu yüklendi!` : `${city} location loaded!`);
            return true;
          }
        }
      } catch {}
      return false;
    };

    if (!navigator.geolocation) {
      await fallbackToIP();
      return;
    }

    const timer = setTimeout(async () => {
      if (!resolved) {
        await fallbackToIP();
      }
    }, 3800);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        toast.dismiss(toastId);
        setGeoDetecting(false);
        loadWeather(
          pos.coords.latitude,
          pos.coords.longitude,
          isTurkish ? "Mevcut Konumunuz" : "Your Location",
          "GPS"
        );
        toast.success(isTurkish ? "Konumunuz başarıyla tespit edildi!" : "Location successfully detected!");
      },
      async () => {
        if (resolved) return;
        clearTimeout(timer);
        const ok = await fallbackToIP();
        if (!ok) {
          toast.dismiss(toastId);
          setGeoDetecting(false);
          toast.error(isTurkish ? "Konum tespit edilemedi, lütfen şehri elle arayın." : "Could not detect location, please search manually.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 300000,
      }
    );
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="h-16 w-16 sm:h-20 sm:w-20 text-amber-400 animate-pulse" />;
    if (code === 2 || code === 3) return <CloudSun className="h-16 w-16 sm:h-20 sm:w-20 text-sky-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="h-16 w-16 sm:h-20 sm:w-20 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="h-16 w-16 sm:h-20 sm:w-20 text-indigo-200" />;
    if (code >= 95) return <CloudLightning className="h-16 w-16 sm:h-20 sm:w-20 text-yellow-400" />;
    return <CloudSun className="h-16 w-16 sm:h-20 sm:w-20 text-sky-400" />;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur-xl">
          <CloudSun className="h-4 w-4 text-sky-400" />
          <span>{isTurkish ? "Open-Meteo Canlı Küresel Radar" : "Open-Meteo Live Global Radar"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "Canlı Hava Durumu & Hava Kalitesi Radarı" : "Live Weather & Air Quality Radar"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "7 günlük saatlik hava tahminleri, UV indeksi ve PM2.5/PM10 hava kalitesi indeksini (AQI) anlık ve doğru verilerle takip edin."
            : "Track 7-day hourly forecasts, UV index, and PM2.5/PM10 Air Quality Index (AQI) with real-time accuracy."}
        </p>
      </div>

      {/* Search & Location Bar */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleCitySearch(e.target.value)}
                placeholder={isTurkish ? "Şehir veya ilçe arayın (örn: İstanbul, Kadıköy, Berlin)..." : "Search city or district (e.g. London, Tokyo)..."}
                className="w-full rounded-2xl border border-white/10 bg-[#0d0e12]/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none backdrop-blur-2xl shadow-xl transition-all"
              />
            </div>
            <button
              onClick={handleUseCurrentLocation}
              disabled={geoDetecting}
              title={isTurkish ? "Konumumu Tespit Et" : "Detect My Location"}
              className="flex items-center gap-2 rounded-2xl bg-sky-500/20 border border-sky-500/40 px-4 py-3 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition-all shrink-0 cursor-pointer shadow-lg shadow-sky-500/10"
            >
              <Navigation className={`h-4 w-4 ${geoDetecting ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">{geoDetecting ? (isTurkish ? "Tespit Ediliyor..." : "Detecting...") : isTurkish ? "Konumum" : "Locate Me"}</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {citySuggestions.length > 0 && (
            <div className="absolute top-14 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-[#0d0e12]/95 backdrop-blur-3xl p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto">
              {citySuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCity(item)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-sky-400" />
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    {item.admin1 && <span className="text-zinc-500 text-xs">({item.admin1})</span>}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                    {item.country}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Popular Cities */}
        <HorizontalScrollContainer className="flex items-center gap-1.5 pb-1 text-xs no-scrollbar">
          <Sparkles className="h-3.5 w-3.5 text-zinc-500 shrink-0 mr-1" />
          {POPULAR_CITIES.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(c.name);
                loadWeather(c.lat, c.lon, c.name, c.country);
              }}
              className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:text-white hover:border-sky-500/40 transition-all shrink-0 font-medium text-xs cursor-pointer"
            >
              {c.name}
            </button>
          ))}
        </HorizontalScrollContainer>
      </div>

      {/* Main Weather Grid */}
      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 Cols: Main Temperature & Current Conditions Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-7 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[480px]">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-sky-400" />
                    <div>
                      <h2 className="text-xl font-black text-white">{weather.city}</h2>
                      <span className="text-xs text-zinc-400 font-mono">{weather.country}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => loadWeather(weather.latitude, weather.longitude, weather.city, weather.country)}
                    className="flex items-center gap-1.5 text-xs font-mono text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    <span>{isTurkish ? "Canlı" : "Live"}</span>
                  </button>
                </div>

                {/* Big Temperature Hero */}
                <div className="flex items-center justify-between my-6">
                  <div>
                    <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                      {weather.current.temperature}°C
                    </div>
                    <div className="text-sm font-semibold text-sky-300 mt-2">
                      {weather.current.weatherDescription}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {isTurkish ? "Hissedilen:" : "Feels like:"} <span className="text-zinc-200 font-bold">{weather.current.apparentTemperature}°C</span>
                    </div>
                  </div>
                  <div>{getWeatherIcon(weather.current.weatherCode)}</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                  <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                      <Wind className="h-4 w-4 text-cyan-400" />
                      <span>{isTurkish ? "Rüzgar" : "Wind"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-mono">{weather.current.windSpeed} km/h</div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span>{isTurkish ? "Nem" : "Humidity"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-mono">%{weather.current.relativeHumidity}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                      <Sun className="h-4 w-4 text-amber-400" />
                      <span>{isTurkish ? "UV İndeksi" : "UV Index"}</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-mono">{weather.current.uvIndex}</div>
                  </div>
                </div>

                {/* Air Quality Banner */}
                {weather.airQuality && (
                  <div className="p-4 rounded-2xl border border-white/10 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">{isTurkish ? "Hava Kalitesi (AQI)" : "Air Quality (AQI)"}</div>
                        <div className="text-xs text-emerald-400 font-semibold">{weather.airQuality.qualityLabel}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono text-zinc-400">
                      PM2.5: <span className="text-zinc-200 font-bold">{weather.airQuality.pm2_5}</span> | PM10: <span className="text-zinc-200 font-bold">{weather.airQuality.pm10}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: 24-Hour Timeline & 7-Day Forecast */}
          <div className="lg:col-span-7 space-y-6">
            {/* 24-Hour Hourly Scroll */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Sun className="h-4 w-4 text-sky-400" />
                <span>{isTurkish ? "Önümüzdeki 24 Saatlik Sıcaklık & Yağış İhtimali" : "Next 24 Hours Temperature & Rain Probability"}</span>
              </h3>

              <HorizontalScrollContainer className="flex gap-3 pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {weather.hourly.time.map((timeStr, idx) => {
                  const hour = new Date(timeStr).getHours();
                  const temp = Math.round(weather.hourly.temperature[idx]);
                  const pop = weather.hourly.precipitationProbability[idx] || 0;

                  return (
                    <div
                      key={idx}
                      className="shrink-0 p-3 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-between min-w-[76px] space-y-2 hover:border-sky-500/30 transition-all cursor-pointer"
                    >
                      <span className="text-xs font-mono text-zinc-400">{hour}:00</span>
                      <CloudSun className="h-5 w-5 text-sky-300" />
                      <span className="text-xs font-bold text-white">{temp}°C</span>
                      <span className="text-[11px] font-mono text-cyan-400 font-semibold">%{pop}</span>
                    </div>
                  );
                })}
              </HorizontalScrollContainer>
            </div>

            {/* 7-Day Forecast Cards */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
              <h3 className="text-xs font-bold text-white mb-3">
                {isTurkish ? "7 Günlük Genel Tahmin" : "7-Day Weather Forecast"}
              </h3>
              {weather.daily.time.slice(0, 7).map((dayStr, idx) => {
                const date = new Date(dayStr);
                const dayName = date.toLocaleDateString(isTurkish ? "tr-TR" : "en-US", { weekday: "long" });
                const max = Math.round(weather.daily.temperatureMax[idx]);
                const min = Math.round(weather.daily.temperatureMin[idx]);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
                  >
                    <span className="text-xs font-semibold text-zinc-200 capitalize w-32">{dayName}</span>
                    <CloudSun className="h-4 w-4 text-sky-400" />
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-zinc-400">{min}°C</span>
                      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-amber-400"
                          style={{ width: `${Math.min(100, Math.max(20, ((max - min) / 20) * 100))}%` }}
                        />
                      </div>
                      <span className="text-white font-bold">{max}°C</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
