"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  MapPin,
  Search,
  Sunrise,
  Sunset,
  ShieldAlert,
  Activity,
  Compass,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { fetchLiveWeather, searchCities, type WeatherData } from "@/lib/api-clients";

export function WeatherAirQualityClient() {
  const [query, setQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Array<any>>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Default Istanbul coordinates
  const loadWeather = async (lat: number, lon: number, cityName = "İstanbul", country = "TR") => {
    setLoading(true);
    try {
      const data = await fetchLiveWeather(lat, lon, cityName, country);
      setWeather(data);
    } catch (err) {
      toast.error("Hava durumu verisi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(41.0082, 28.9784, "İstanbul", "TR");
  }, []);

  const handleCitySearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length >= 2) {
      const results = await searchCities(val);
      setCitySuggestions(results);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSelectCity = (city: any) => {
    setCitySuggestions([]);
    setQuery(`${city.name}, ${city.country}`);
    loadWeather(city.latitude, city.longitude, city.name, city.country);
    toast.success(`${city.name} hava durumu yüklendi!`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }
    toast.loading("Konumunuz tespit ediliyor...", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss("geo");
        loadWeather(pos.coords.latitude, pos.coords.longitude, "Mevcut Konumunuz", "GPS");
        toast.success("Mevcut konumunuzun hava durumu yüklendi!");
      },
      (err) => {
        toast.dismiss("geo");
        toast.error("Konum izni reddedildi veya bulunamadı.");
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300 backdrop-blur-xl mb-3">
          <CloudSun className="h-3.5 w-3.5 text-sky-400" />
          <span>Open-Meteo Global Radar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Canlı Hava Durumu & Hava Kalitesi Radarı
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          7 günlük saatlik hava tahminleri, UV indeksi ve PM2.5/PM10 hava kalitesi indeksini (AQI) %100 açık kaynak veriyle canlı takip edin.
        </p>
      </div>

      {/* Search & Geo Bar */}
      <div className="max-w-xl mx-auto mb-8 relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleCitySearch(e.target.value)}
              placeholder="Şehir veya ülke arayın (örn: Ankara, Berlin, Tokyo)..."
              className="w-full rounded-2xl border border-white/10 bg-[#0d0e12]/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none backdrop-blur-2xl shadow-xl"
            />
          </div>
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-1.5 rounded-2xl bg-sky-500/20 border border-sky-500/40 px-4 py-2.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition-all shrink-0"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Konumum</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {citySuggestions.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-[#0d0e12]/95 backdrop-blur-3xl p-2 shadow-2xl space-y-1">
            {citySuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectCity(item)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="font-semibold text-white">{item.name}</span>
                  {item.admin1 && <span className="text-zinc-500">({item.admin1})</span>}
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{item.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Weather View */}
      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 Cols: Main Temperature & Current Conditions Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[460px]">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-sky-400" />
                    <div>
                      <h2 className="text-base font-bold text-white">{weather.city}</h2>
                      <span className="text-[11px] text-zinc-400">{weather.country}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    Canlı
                  </span>
                </div>

                {/* Big Temperature Hero */}
                <div className="flex items-center justify-between my-6">
                  <div>
                    <div className="text-6xl font-extrabold text-white tracking-tighter">
                      {weather.current.temperature}°C
                    </div>
                    <div className="text-xs text-sky-300 font-medium mt-1">
                      {weather.current.weatherDescription}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Hissedilen: {weather.current.apparentTemperature}°C
                    </div>
                  </div>
                  <CloudSun className="h-20 w-20 text-sky-400/80 animate-pulse" />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/10 pt-5">
                <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                    <Wind className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Rüzgar</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono">{weather.current.windSpeed} km/s</div>
                </div>

                <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                    <Droplets className="h-3.5 w-3.5 text-blue-400" />
                    <span>Nem</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono">%{weather.current.relativeHumidity}</div>
                </div>

                <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>UV İndeksi</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono">{weather.current.uvIndex}</div>
                </div>
              </div>

              {/* Air Quality Banner */}
              {weather.airQuality && (
                <div className="mt-4 p-3.5 rounded-2xl border border-white/10 bg-black/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Hava Kalitesi (AQI)</div>
                      <div className="text-[11px] text-emerald-400 font-medium">{weather.airQuality.qualityLabel}</div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-zinc-400">
                    PM2.5: <span className="text-zinc-200">{weather.airQuality.pm2_5}</span> | PM10: <span className="text-zinc-200">{weather.airQuality.pm10}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 7 Cols: 24-Hour Timeline & 7-Day Forecast */}
          <div className="lg:col-span-7 space-y-6">
            {/* 24-Hour Hourly Scroll */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl">
              <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-sky-400" />
                <span>Önümüzdeki 24 Saatlik Sıcaklık & Yağış İhtimali</span>
              </h3>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {weather.hourly.time.map((timeStr, idx) => {
                  const hour = new Date(timeStr).getHours();
                  const temp = Math.round(weather.hourly.temperature[idx]);
                  const pop = weather.hourly.precipitationProbability[idx] || 0;

                  return (
                    <div
                      key={idx}
                      className="shrink-0 p-3 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-between min-w-[72px] space-y-2 hover:border-sky-500/30 transition-all"
                    >
                      <span className="text-[11px] font-mono text-zinc-400">{hour}:00</span>
                      <CloudSun className="h-5 w-5 text-sky-300" />
                      <span className="text-xs font-bold text-white">{temp}°C</span>
                      <span className="text-[10px] font-mono text-cyan-400">%{pop}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Forecast Cards */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
              <h3 className="text-xs font-semibold text-white mb-3">7 Günlük Genel Tahmin</h3>
              {weather.daily.time.slice(0, 7).map((dayStr, idx) => {
                const date = new Date(dayStr);
                const dayName = date.toLocaleDateString("tr-TR", { weekday: "long" });
                const max = Math.round(weather.daily.temperatureMax[idx]);
                const min = Math.round(weather.daily.temperatureMin[idx]);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
                  >
                    <span className="text-xs font-medium text-zinc-200 capitalize w-28">{dayName}</span>
                    <CloudSun className="h-4 w-4 text-sky-400" />
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-zinc-400">{min}°C</span>
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-amber-400" style={{ width: `${Math.min(100, ((max - min) / 20) * 100)}%` }} />
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
