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
  Columns,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_MARKDOWN = `# EverythingHub Markdown Studio

Hoş geldiniz! Bu profesyonel stüdyo ile **Markdown** belgelerinizi canlı olarak oluşturabilir, düzenleyebilir ve anında önizleyebilirsiniz.

## Öne Çıkan Özellikler
- **%100 İstemci Taraflı**: Verileriniz hiçbir sunucuya gönderilmez, tarayıcıda kalır.
- **Canlı Metrikler**: Kelime, karakter ve tahmini okuma süresi hesabı.
- **Dışa Aktarma**: Tek tıkla HTML veya .md formatında anında indirin.

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
  const [activeView, setActiveView] = useState<"split" | "edit" | "preview">("split");

  // Metrics
  const words = markdown.trim() ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = markdown.length;
  const sentences = markdown.split(/[.!?]+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const insertSnippet = (prefix: string, suffix = "") => {
    setMarkdown((prev) => prev + `\n${prefix}Örnek Metin${suffix}`);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Markdown metni panoya kopyalandı!");
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
    toast.success(`${filename} dosyası başarıyla indirildi!`);
  };

  const exportHTML = () => {
    const parsedHtml = parseMarkdownToHTML(markdown);
    const fullHtmlDoc = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>EverythingHub Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f9f9f9; }
  </style>
</head>
<body>
${parsedHtml}
</body>
</html>`;
    downloadFile("everythinghub-document.html", fullHtmlDoc, "text/html");
  };

  // Client-side lightweight markdown parser
  const parseMarkdownToHTML = (md: string) => {
    const html = md
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
          <span>Zero-Auth Markdown Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Markdown Studio & Canlı Önizleme
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Markdown dokümanlarınızı düzenleyin, anında önizleyin ve metriklerle HTML/.md olarak dışa aktarın.
        </p>
      </div>

      {/* Toolbar & View Switcher */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-4 shadow-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick Format Snippets */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => insertSnippet("# ")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Başlık"
          >
            <Heading className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSnippet("**", "**")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Kalın"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSnippet("*", "*")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="İtalik"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSnippet("- ")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Liste"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSnippet("```javascript\n", "\n```")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Kod Bloğu"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSnippet("| Başlık 1 | Başlık 2 |\n| --- | --- |\n| Veri 1 | Veri 2 |")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
            title="Tablo"
          >
            <Table className="h-4 w-4" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveView("split")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeView === "split" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-zinc-400"
            }`}
          >
            Çift Görünüm
          </button>
          <button
            onClick={() => setActiveView("edit")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeView === "edit" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-zinc-400"
            }`}
          >
            Editör
          </button>
          <button
            onClick={() => setActiveView("preview")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeView === "preview" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-zinc-400"
            }`}
          >
            Önizleme
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.1] transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Kopyala</span>
          </button>

          <button
            onClick={() => downloadFile("document.md", markdown, "text/markdown")}
            className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>.md İndir</span>
          </button>

          <button
            onClick={exportHTML}
            className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>HTML İndir</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Box */}
        {(activeView === "split" || activeView === "edit") && (
          <div className={`rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-4 shadow-2xl flex flex-col ${activeView === "edit" ? "lg:col-span-2" : ""}`}>
            <div className="text-xs font-bold text-zinc-400 mb-2 border-b border-white/5 pb-2 flex items-center justify-between">
              <span>MARKDOWN SOURCE</span>
              <span className="font-mono text-[10px] text-zinc-500">{chars} Karakter</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[520px] bg-transparent text-xs font-mono text-zinc-200 resize-none focus:outline-none leading-relaxed p-2"
              placeholder="Markdown metninizi buraya yazın..."
            />
          </div>
        )}

        {/* Live Preview Box */}
        {(activeView === "split" || activeView === "preview") && (
          <div className={`rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col ${activeView === "preview" ? "lg:col-span-2" : ""}`}>
            <div className="text-xs font-bold text-zinc-400 mb-4 border-b border-white/5 pb-2 flex items-center justify-between">
              <span>CANLI ÖNİZLEME</span>
              <span className="font-mono text-[10px] text-purple-400 font-bold">{words} Kelime · ~{readingTime} dk Okuma</span>
            </div>
            <div
              className="h-[520px] overflow-y-auto pr-2 prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
