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
  Sliders,
  Layers,
  ShoppingBag,
  CreditCard,
  Server,
  Activity,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

type DataTemplate = "users" | "ecommerce" | "finance" | "saas" | "healthcare" | "logs";
type OutputFormat = "json" | "csv" | "sql" | "typescript";

const TR_FIRST_NAMES = [
  "Ahmet", "Mehmet", "Mustafa", "Ali", "Can", "Burak", "Emre", "Zeynep", "Elif", "Ayşe",
  "Fatma", "Merve", "Büşra", "Selin", "Ece", "Deniz", "Kaan", "Oğuz", "Cem", "Berk",
  "Eren", "Yusuf", "Gamze", "Tuğçe", "Kerem", "Sarp", "Derin", "Arda", "İrem", "Defne"
];

const TR_LAST_NAMES = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
  "Bulut", "Polat", "Erdoğan", "Aksoy", "Güler", "Yalçın", "Güneş", "Bozkurt", "Yavuz", "Karaca"
];

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Eskişehir", "Trabzon", "Samsun", "Muğla"];
const COMPANIES = ["AegisSoft Teknoloji", "Vortex Bilişim", "Nova Lojistik", "Atlas Medya", "Kuantum Yazılım", "Solaris Enerji", "Apex Finans", "Pixel Mimarlık", "HyperCloud", "Zeta Siber Güvenlik"];
const ROLES = ["Software Architect", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Product Manager", "UI/UX Designer", "Data Analyst", "Security Specialist"];
const PRODUCTS = ["Mekanik Klavye Pro", "Ultra Geniş 4K Monitör", "Kablosuz ANC Kulaklık", "Ergonomik Çalışma Koltuğu", "USB-C Thunderbolt Dock", "Akıllı Saat Ultra", "Taşınabilir NVMe SSD 2TB", "Yapay Zeka Grafik Tableti"];
const CATEGORIES = ["Elektronik", "Yazılım Donanım", "Ofis & Çalışma", "Ses Sistemleri", "Aksesuarlar"];
const PAYMENT_METHODS = ["Kredi Kartı", "Havale / EFT", "Kripto Ödeme", "Apple Pay", "Google Pay"];
const BLOOD_TYPES = ["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-"];
const HOSPITALS = ["Merkez Şehir Hastanesi", "Memorial Sağlık", "Acıbadem Kliniği", "Medicana Tıp", "Florence Nightingale"];
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const HTTP_STATUSES = [200, 200, 200, 201, 204, 400, 401, 403, 404, 500, 502];

export function MockDataGeneratorClient() {
  const [template, setTemplate] = useState<DataTemplate>("users");
  const [count, setCount] = useState<number>(50);
  const [customInput, setCustomInput] = useState<string>("50");
  const [format, setFormat] = useState<OutputFormat>("json");
  const [mockList, setMockList] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const presets = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  const generateData = () => {
    setIsGenerating(true);
    const targetCount = Math.max(1, Math.min(50000, count));
    const items: any[] = [];

    for (let i = 1; i <= targetCount; i++) {
      const first = TR_FIRST_NAMES[Math.floor(Math.random() * TR_FIRST_NAMES.length)];
      const last = TR_LAST_NAMES[Math.floor(Math.random() * TR_LAST_NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const id = i;
      const uuid = crypto.randomUUID();

      if (template === "users") {
        items.push({
          id,
          uuid,
          fullName: `${first} ${last}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`,
          phone: `+90 5${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
          city,
          company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          age: Math.floor(Math.random() * 40 + 22),
          isActive: Math.random() > 0.15,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString().split("T")[0],
        });
      } else if (template === "ecommerce") {
        const price = Math.floor(Math.random() * 9500 + 450);
        const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 25 + 5) : 0;
        const qty = Math.floor(Math.random() * 5 + 1);
        items.push({
          orderId: `ORD-${20260000 + i}`,
          customerName: `${first} ${last}`,
          productName: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
          category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
          unitPriceTRY: price,
          discountPercent: discount,
          quantity: qty,
          totalAmountTRY: Math.round(price * (1 - discount / 100) * qty),
          paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
          status: Math.random() > 0.1 ? "Tamamlandı" : "Kargoda",
          orderDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split("T")[0],
        });
      } else if (template === "finance") {
        const amount = Math.floor(Math.random() * 75000 + 100);
        items.push({
          transactionId: `TX-${uuid.slice(0, 8).toUpperCase()}`,
          accountHolder: `${first} ${last}`,
          iban: `TR${Math.floor(Math.random() * 90 + 10)} 0006 2000 0001 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 90 + 10)}`,
          type: Math.random() > 0.4 ? "FAST / Havale" : "EFT Transfer",
          currency: Math.random() > 0.3 ? "TRY" : Math.random() > 0.5 ? "USD" : "EUR",
          amount,
          fee: Math.round(amount * 0.0015 * 100) / 100,
          status: "Onaylandı",
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
        });
      } else if (template === "saas") {
        const tier = Math.random() > 0.6 ? "Enterprise" : Math.random() > 0.3 ? "Pro Growth" : "Starter";
        const mrr = tier === "Enterprise" ? 1499 : tier === "Pro Growth" ? 299 : 49;
        items.push({
          subscriptionId: `SUB-${10000 + i}`,
          tenantName: `${first} Yazılım Ltd.`,
          planTier: tier,
          monthlyRevenueUSD: mrr,
          billingCycle: Math.random() > 0.4 ? "Yıllık" : "Aylık",
          seatsAllocated: tier === "Enterprise" ? 50 : tier === "Pro Growth" ? 10 : 3,
          status: Math.random() > 0.08 ? "Active" : "Trial",
          autoRenew: true,
        });
      } else if (template === "healthcare") {
        items.push({
          patientId: `MED-${80000 + i}`,
          patientName: `${first} ${last}`,
          bloodType: BLOOD_TYPES[Math.floor(Math.random() * BLOOD_TYPES.length)],
          hospital: HOSPITALS[Math.floor(Math.random() * HOSPITALS.length)],
          department: "Kardiyoloji & Dahiliye",
          doctor: `Uzm. Dr. ${TR_FIRST_NAMES[Math.floor(Math.random() * TR_FIRST_NAMES.length)]} ${TR_LAST_NAMES[Math.floor(Math.random() * TR_LAST_NAMES.length)]}`,
          bloodPressure: `${Math.floor(Math.random() * 30 + 110)}/${Math.floor(Math.random() * 20 + 70)}`,
          status: "Tedavi Edildi",
        });
      } else if (template === "logs") {
        const method = HTTP_METHODS[Math.floor(Math.random() * HTTP_METHODS.length)];
        const status = HTTP_STATUSES[Math.floor(Math.random() * HTTP_STATUSES.length)];
        items.push({
          logId: uuid,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`,
          method,
          endpoint: `/api/v1/${template}/${i}`,
          statusCode: status,
          latencyMs: Math.floor(Math.random() * 120 + 8),
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0",
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        });
      }
    }

    setMockList(items);
    setIsGenerating(false);
    toast.success(`${targetCount.toLocaleString("tr-TR")} adet "${template}" mock kaydı üretildi!`);
  };

  useEffect(() => {
    generateData();
  }, [count, template]);

  const handleManualCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      const clamped = Math.min(50000, val);
      setCount(clamped);
      setCustomInput(clamped.toString());
    } else {
      toast.error("Lütfen 1 ile 50.000 arasında geçerli bir sayı girin.");
    }
  };

  const getFormattedOutput = () => {
    if (mockList.length === 0) return "";

    if (format === "json") {
      return JSON.stringify(mockList, null, 2);
    }

    if (format === "csv") {
      const headers = Object.keys(mockList[0]).join(",");
      const rows = mockList.map((row) =>
        Object.values(row)
          .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
          .join(",")
      );
      return [headers, ...rows].join("\n");
    }

    if (format === "sql") {
      const table = `mock_${template}`;
      const columns = Object.keys(mockList[0]).join(", ");
      const statements = mockList.map((row) => {
        const values = Object.values(row).map((v) => {
          if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === "boolean") return v ? "1" : "0";
          return v;
        });
        return `INSERT INTO ${table} (${columns}) VALUES (${values.join(", ")});`;
      });
      return statements.join("\n");
    }

    if (format === "typescript") {
      const typeName = template.charAt(0).toUpperCase() + template.slice(1) + "Record";
      const sample = mockList[0];
      const interfaceProps = Object.entries(sample)
        .map(([k, v]) => `  ${k}: ${typeof v};`)
        .join("\n");
      return `export interface ${typeName} {\n${interfaceProps}\n}\n\nexport const mock${typeName}List: ${typeName}[] = ${JSON.stringify(
        mockList,
        null,
        2
      )};`;
    }

    return "";
  };

  const outputString = getFormattedOutput();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputString);
    setCopied(true);
    toast.success("Veriler panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<OutputFormat, string> = {
      json: "json",
      csv: "csv",
      sql: "sql",
      typescript: "ts",
    };
    const mimeMap: Record<OutputFormat, string> = {
      json: "application/json",
      csv: "text/csv",
      sql: "application/sql",
      typescript: "text/typescript",
    };
    const ext = extMap[format];
    const blob = new Blob([outputString], { type: mimeMap[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `everythinghub-${template}-data-${count}.${ext}`;
    a.click();
    toast.success(`${ext.toUpperCase()} dosyası başarıyla indirildi!`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span>High-Scale Mock Identity & Dataset Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Geliştiriciler İçin Akıllı Mock Veri Üreteci
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          E-ticaret, finans, SaaS, kullanıcı kimlikleri ve sunucu logları için 50.000 kayda kadar anında JSON, CSV, SQL ve TypeScript test verisi üretin.
        </p>
      </div>

      {/* Template Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { id: "users", label: "Kullanıcı & Profil", icon: Users },
          { id: "ecommerce", label: "E-Ticaret Sipariş", icon: ShoppingBag },
          { id: "finance", label: "Finans & IBAN", icon: CreditCard },
          { id: "saas", label: "SaaS Abonelik", icon: Briefcase },
          { id: "healthcare", label: "Sağlık & Hasta", icon: Activity },
          { id: "logs", label: "Sunucu Logları", icon: Server },
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = template === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id as DataTemplate)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                isSelected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Custom Count Input, Presets & Export Format */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-5 shadow-2xl mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Preset Buttons & Custom Form */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span>Kayıt Sayısı:</span>
            </span>
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setCount(p);
                  setCustomInput(p.toString());
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold font-mono transition-all ${
                  count === p
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "bg-white/[0.04] text-zinc-300 border border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                {p.toLocaleString("tr-TR")}
              </button>
            ))}

            {/* Custom Manual Input */}
            <form onSubmit={handleManualCountSubmit} className="flex items-center gap-1.5 ml-2">
              <input
                type="number"
                min="1"
                max="50000"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Özel sayı..."
                className="w-24 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
              >
                Uygula
              </button>
            </form>
          </div>

          {/* Export Formats & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
              {(["json", "csv", "sql", "typescript"] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase transition-all ${
                    format === f
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f === "typescript" ? "TS" : f}
                </button>
              ))}
            </div>

            <button
              onClick={generateData}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10"
              title="Yeniden Üret"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>Yenile</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25"
            >
              <Download className="h-3.5 w-3.5" />
              <span>İndir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code / Data Preview Window */}
      <div className="rounded-2xl border border-white/10 bg-[#090a0f] p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-zinc-400 ml-2">
              {template.toUpperCase()} · {count.toLocaleString("tr-TR")} KAYIT · {format.toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {(new Blob([outputString]).size / 1024).toFixed(1)} KB
          </span>
        </div>

        <pre className="max-h-[560px] overflow-auto text-xs font-mono text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
          <code>{outputString.slice(0, 80000)}</code>
          {outputString.length > 80000 && (
            <div className="text-xs text-zinc-500 mt-4 italic">
              ... Devamı için ({count.toLocaleString("tr-TR")} kayıt) &quot;İndir&quot; butonunu kullanın.
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}
