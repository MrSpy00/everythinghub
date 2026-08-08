"use client";

import React, { useState } from "react";
import {
  FileText,
  Eye,
  Edit3,
  Download,
  Copy,
  Check,
  Code,
  Table,
  Bold,
  Italic,
  List,
  Heading,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_MARKDOWN = `# EverythingHub Markdown Studio

Hoş geldiniz! Bu editör ile **Markdown** belgelerinizi canlı olarak oluşturabilir ve anında önizleyebilirsiniz.

## Öne Çıkan Özellikler
- **%100 İstemci Taraflı**: Verileriniz hiçbir sunucuya gönderilmez.
- **Canlı Metrikler**: Kelime, karakter ve tahmini okuma süresi hesabı.
- **Dışa Aktarma**: Tek tıkla HTML veya .md formatında indirin.

### Örnek Kod Bloğu
\`\`\`javascript
function calculateMetrics(text) {
  const words = text.trim().split(/\\s+/).filter(Boolean).length;
  return { words, readingTimeMin: Math.ceil(words / 200) };
}
\`\`\`

### Örnek Tablo
| Özellik | Durum | Uyum |
| :--- | :---: | ---: |
| Sıfır-Auth | Aktif | 100% |
| Hızlı Render | Aktif | 60fps |
`;

export function MarkdownStudioClient() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">("split");

  // Metrics
  const words = markdown.trim() ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = markdown.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const insertText = (prefix: string, suffix = "") => {
    setMarkdown((prev) => prev + `\n${prefix}Metin${suffix}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Markdown metni kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} dosyası indirildi!`);
  };

  // Simple quick markdown to HTML parser for client side without dependencies
  const parseMarkdownToHTML = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-indigo-400 mt-6 mb-3 border-b border-white/10 pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-white mt-2 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-indigo-300">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic text-zinc-300">$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-black/60 border border-white/10 p-4 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto my-3"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-zinc-300">$1</li>')
      .replace(/\n$/gim, "<br />");
    return html;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-xl mb-3">
          <FileText className="h-3.5 w-3.5 text-purple-400" />
          <span>Zero-Auth Markdown Workbench</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Markdown Studio & Canlı Editör
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Markdown dokümanlarınızı düzenleyin, anında önizleyin ve metriklerle dışa aktarın.
        </p>
      </div>

      {/* Toolbar & View Switcher */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-4 shadow-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick Format Tools */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => insertText("# ")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Başlık"
          >
            <Heading className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText("**", "**")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Kalın"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText("*", "*")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="İtalik"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText("- ")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Liste"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText("```\n", "\n```")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Kod Bloğu"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText("| Başlık 1 | Başlık 2 |\n| --- | --- |\n| Veri 1 | Veri 2 |")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Tablo"
          >
            <Table className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("split")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "split" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              İkili Görünüm
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "edit" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              Editör
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "preview" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              Önizleme
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white hover:bg-white/[0.08] transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
            <span>Kopyala</span>
          </button>

          <button
            onClick={() => downloadFile("document.md", markdown, "text/markdown")}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/20 px-3.5 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-indigo-300" />
            <span>.MD İndir</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(activeTab === "split" || activeTab === "edit") && (
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-4 shadow-2xl flex flex-col h-[550px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" /> Markdown Kaynak Kodu
              </span>
              <span className="text-xs text-zinc-500">{words} Kelime | {chars} Karakter</span>
            </div>

            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full bg-transparent font-mono text-xs text-zinc-200 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-white/10 leading-relaxed"
              placeholder="Markdown içeriğinizi buraya yazın..."
            />
          </div>
        )}

        {(activeTab === "split" || activeTab === "preview") && (
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-4 shadow-2xl flex flex-col h-[550px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-emerald-400" /> Canlı HTML Önizleme
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-400" /> Tahmini Okuma: ~{readingTime} dk
              </span>
            </div>

            <div
              className="flex-1 overflow-y-auto pr-2 text-sm text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
