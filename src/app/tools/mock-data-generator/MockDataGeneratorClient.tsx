"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Database,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Code2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const TR_FIRST_NAMES = ["Ahmet", "Mehmet", "Mustafa", "Ali", "Can", "Burak", "Emre", "Zeynep", "Elif", "Ayşe", "Fatma", "Merve", "Büşra", "Selin", "Ece", "Deniz", "Kaan", "Oğuz", "Cem", "Berk"];
const TR_LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek"];
const TR_CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Eskişehir", "Trabzon", "Samsun", "Muğla"];
const COMPANIES = ["AegisSoft Teknoloji", "Vortex Bilişim", "Nova Lojistik", "Atlas Medya", "Kuantum Yazılım", "Solaris Enerji", "Apex Finans", "Pixel Mimarlık"];

export function MockDataGeneratorClient() {
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [locale, setLocale] = useState<"tr" | "en">("tr");
  const [mockList, setMockList] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const generateData = () => {
    const data = [];
    for (let i = 1; i <= count; i++) {
      const first = TR_FIRST_NAMES[Math.floor(Math.random() * TR_FIRST_NAMES.length)];
      const last = TR_LAST_NAMES[Math.floor(Math.random() * TR_LAST_NAMES.length)];
      const city = TR_CITIES[Math.floor(Math.random() * TR_CITIES.length)];
      const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      const id = crypto.randomUUID();
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 99)}@example.com`;
      const phone = `+90 5${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`;

      data.push({
        id,
        fullName: `${first} ${last}`,
        email,
        phone,
        city,
        company,
        role: "Software Engineer",
        isActive: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split("T")[0],
      });
    }
    setMockList(data);
    toast.success(`${count} adet mock kayıt üretildi!`);
  };

  useEffect(() => {
    generateData();
  }, [count, locale]);

  const getFormattedOutput = () => {
    if (format === "json") {
      return JSON.stringify(mockList, null, 2);
    } else {
      if (mockList.length === 0) return "";
      const headers = Object.keys(mockList[0]).join(",");
      const rows = mockList.map((row) => Object.values(row).map((v) => `"${v}"`).join(","));
      return [headers, ...rows].join("\n");
    }
  };

  const outputString = getFormattedOutput();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputString);
    setCopied(true);
    toast.success("Veri panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mime = format === "json" ? "application/json" : "text/csv";
    const ext = format === "json" ? "json" : "csv";
    const blob = new Blob([outputString], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `everythinghub-mock-data.${ext}`;
    a.click();
    toast.success(`${ext.toUpperCase()} dosyası indirildi!`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span>Mock Identity & Test Data Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Geliştiriciler İçin Akıllı Mock Veri Üreteci
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Testler ve prototipler için Türkçe ve uluslararası sahte kimlikler, adresler, telefon numaraları ve JSON/CSV mock verileri üretin.
        </p>
      </div>

      {/* Main Studio Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-300">Format:</span>
            <div className="flex gap-1.5">
              {(["json", "csv"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase font-mono transition-all ${
                    format === fmt
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-300">Kayıt Sayısı:</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
            >
              <option value={5}>5 Kayıt</option>
              <option value={10}>10 Kayıt</option>
              <option value={25}>25 Kayıt</option>
              <option value={50}>50 Kayıt</option>
            </select>

            <button
              onClick={generateData}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Yeniden Üret</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.1] transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Kopyala</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>İndir (.{format})</span>
            </button>
          </div>
        </div>

        {/* Output Pre box */}
        <pre className="w-full h-96 rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-emerald-300 overflow-auto scrollbar-thin scrollbar-thumb-white/10 leading-relaxed">
          {outputString}
        </pre>
      </div>
    </div>
  );
}
