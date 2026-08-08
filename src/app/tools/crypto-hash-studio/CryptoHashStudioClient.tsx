"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Hash,
  Key,
  Shield,
  FileCheck,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export function CryptoHashStudioClient() {
  const [activeTab, setActiveTab] = useState<"text" | "file" | "uuid">("text");

  // Text Hash states
  const [inputText, setInputText] = useState("EverythingHub Universal Developer Studio 2026");
  const [hmacKey, setHmacKey] = useState("secret-key");
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha512: string;
    sha384: string;
    sha1: string;
    hmacSha256: string;
  }>({
    sha256: "",
    sha512: "",
    sha384: "",
    sha1: "",
    hmacSha256: "",
  });

  // File Hash states
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileHashes, setFileHashes] = useState<{ sha256: string; sha512: string } | null>(null);
  const [hashingFile, setHashingFile] = useState(false);

  // UUID & NanoID states
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidType, setUuidType] = useState<"v4" | "v7" | "nanoid">("v4");
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Calculate Web Crypto Hashes
  const computeHashes = async (text: string, key: string) => {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // SHA-256
    const buf256 = await crypto.subtle.digest("SHA-256", data);
    const hex256 = Array.from(new Uint8Array(buf256)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // SHA-512
    const buf512 = await crypto.subtle.digest("SHA-512", data);
    const hex512 = Array.from(new Uint8Array(buf512)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // SHA-384
    const buf384 = await crypto.subtle.digest("SHA-384", data);
    const hex384 = Array.from(new Uint8Array(buf384)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // SHA-1
    const buf1 = await crypto.subtle.digest("SHA-1", data);
    const hex1 = Array.from(new Uint8Array(buf1)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // HMAC-SHA256
    let hmacHex = "";
    try {
      const keyData = encoder.encode(key || "default");
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const hmacBuf = await crypto.subtle.sign("HMAC", cryptoKey, data);
      hmacHex = Array.from(new Uint8Array(hmacBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {}

    setHashes({
      sha256: hex256,
      sha512: hex512,
      sha384: hex384,
      sha1: hex1,
      hmacSha256: hmacHex,
    });
  };

  useEffect(() => {
    computeHashes(inputText, hmacKey);
  }, [inputText, hmacKey]);

  // Handle Drag & Drop File Hashing
  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setHashingFile(true);

    try {
      const buffer = await file.arrayBuffer();
      const buf256 = await crypto.subtle.digest("SHA-256", buffer);
      const hex256 = Array.from(new Uint8Array(buf256)).map((b) => b.toString(16).padStart(2, "0")).join("");

      const buf512 = await crypto.subtle.digest("SHA-512", buffer);
      const hex512 = Array.from(new Uint8Array(buf512)).map((b) => b.toString(16).padStart(2, "0")).join("");

      setFileHashes({ sha256: hex256, sha512: hex512 });
      toast.success(`${file.name} hash değerleri hesaplandı!`);
    } catch (err) {
      toast.error("Dosya hash hesaplanamadı.");
    } finally {
      setHashingFile(false);
    }
  };

  // Generate UUID / NanoID
  const generateIdentifiers = () => {
    const results: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      if (uuidType === "v4") {
        results.push(crypto.randomUUID());
      } else if (uuidType === "v7") {
        // Simple time-sortable UUID v7 simulation
        const timeHex = Date.now().toString(16).padStart(12, "0");
        const randHex = Array.from(crypto.getRandomValues(new Uint8Array(10)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        results.push(`${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${randHex.slice(0, 3)}-8${randHex.slice(3, 6)}-${randHex.slice(6, 18)}`);
      } else {
        // NanoID simulation
        const chars = "useandom-26T1983_40STFn9EUZWXxkgTYPQVilmopqrvwxyz";
        let id = "";
        const bytes = crypto.getRandomValues(new Uint8Array(21));
        for (let j = 0; j < 21; j++) {
          id += chars[bytes[j] % chars.length];
        }
        results.push(id);
      }
    }
    setGeneratedUuids(results);
  };

  useEffect(() => {
    generateIdentifiers();
  }, [uuidType, uuidCount]);

  const copyHash = (val: string, keyName: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    toast.success("Panoya kopyalandı!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <Hash className="h-3.5 w-3.5 text-indigo-400" />
          <span>Web Crypto Laboratory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Kriptografik Hash, HMAC & UUID Laboratuvarı
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          SHA-256, SHA-512, HMAC, yerel dosya checksum ve UUID v4/v7/NanoID üretimini %100 tarayıcınızda sıfır gecikmeyle yapın.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="mb-6 flex justify-center gap-2">
        {[
          { id: "text", label: "Metin Hash & HMAC", icon: Lock },
          { id: "file", label: "Dosya Checksum (Yerel)", icon: FileCheck },
          { id: "uuid", label: "UUID v4/v7 & NanoID", icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Area */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
        {/* TAB 1: TEXT HASH */}
        {activeTab === "text" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Girdi Metni</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs font-mono text-zinc-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">HMAC Gizli Anahtarı (Secret)</label>
                <input
                  type="text"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hashes Output List */}
            <div className="space-y-3 pt-2">
              {[
                { name: "SHA-256", val: hashes.sha256, color: "text-emerald-400" },
                { name: "SHA-512", val: hashes.sha512, color: "text-indigo-400" },
                { name: "SHA-384", val: hashes.sha384, color: "text-cyan-400" },
                { name: "SHA-1", val: hashes.sha1, color: "text-amber-400" },
                { name: "HMAC-SHA256", val: hashes.hmacSha256, color: "text-purple-400" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-zinc-400 mb-1">{item.name}</div>
                    <div className={`text-xs font-mono break-all ${item.color}`}>
                      {item.val || "Hesaplanıyor..."}
                    </div>
                  </div>
                  <button
                    onClick={() => copyHash(item.val, item.name)}
                    className="shrink-0 p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedKey === item.name ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FILE CHECKSUM */}
        {activeTab === "file" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-black/40 transition-all">
              <FileCheck className="h-10 w-10 text-indigo-400 mb-3" />
              <p className="text-xs text-zinc-300 font-medium mb-1">
                Dosyanızı buraya sürükleyin veya seçin (Büyük dosyalar dahil)
              </p>
              <p className="text-[11px] text-zinc-500 mb-4">
                Dosya asla bir sunucuya yüklenmez, doğrudan tarayıcınızda okunur.
              </p>
              <label className="cursor-pointer rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all">
                <span>Dosya Seç</span>
                <input type="file" onChange={handleFileDrop} className="hidden" />
              </label>
            </div>

            {hashingFile && (
              <div className="flex items-center justify-center gap-2 text-xs text-indigo-300">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                <span>Dosya hash değeri hesaplanıyor...</span>
              </div>
            )}

            {fileHashes && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-medium text-zinc-400 mb-2">
                  Seçilen Dosya: <span className="text-white font-mono">{fileName}</span> ({fileSize})
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-zinc-400">Dosya SHA-256</div>
                    <div className="text-xs font-mono text-emerald-400 break-all">{fileHashes.sha256}</div>
                  </div>
                  <button
                    onClick={() => copyHash(fileHashes.sha256, "file256")}
                    className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white"
                  >
                    {copiedKey === "file256" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UUID & NANOID */}
        {activeTab === "uuid" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex gap-2">
                {(["v4", "v7", "nanoid"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setUuidType(t)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      uuidType === t
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                        : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                    }`}
                  >
                    {t === "v4" ? "UUID v4 (Rastgele)" : t === "v7" ? "UUID v7 (Zaman Sıralı)" : "NanoID (21 Karakter)"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Adet:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                >
                  <option value={1}>1 Adet</option>
                  <option value={5}>5 Adet</option>
                  <option value={10}>10 Adet</option>
                  <option value={25}>25 Adet</option>
                </select>
                <button
                  onClick={generateIdentifiers}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Yeniden Üret</span>
                </button>
              </div>
            </div>

            {/* UUID List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {generatedUuids.map((id, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] font-mono text-xs text-indigo-300 hover:border-indigo-500/20"
                >
                  <span>{id}</span>
                  <button
                    onClick={() => copyHash(id, `uuid-${index}`)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    {copiedKey === `uuid-${index}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
