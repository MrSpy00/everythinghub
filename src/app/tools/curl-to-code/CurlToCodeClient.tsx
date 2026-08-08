"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Code2,
  Copy,
  Check,
  Sparkles,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token_sample_123" \\
  -d '{"email": "user@everythinghub.com", "password": "securepassword"}'`;

export function CurlToCodeClient() {
  const [curlText, setCurlText] = useState(SAMPLE_CURL);
  const [targetLang, setTargetLang] = useState<"fetch" | "axios" | "python" | "go" | "php">("fetch");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Parse cURL
  const parseCurl = (cmd: string) => {
    let method = "GET";
    let url = "";
    const headers: Record<string, string> = {};
    let body = "";

    const methodMatch = cmd.match(/-X\s+([A-Z]+)/);
    if (methodMatch) method = methodMatch[1];

    const urlMatch = cmd.match(/(?:curl\s+(?:-X\s+[A-Z]+\s+)?["']?)(https?:\/\/[^\s"']+)/);
    if (urlMatch) url = urlMatch[1];

    // Headers
    const headerRegex = /-H\s+["']([^"']+)["']/g;
    let match;
    while ((match = headerRegex.exec(cmd)) !== null) {
      const [k, ...v] = match[1].split(":");
      if (k && v.length > 0) {
        headers[k.trim()] = v.join(":").trim();
      }
    }

    // Body
    const bodyMatch = cmd.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s|$)/);
    if (bodyMatch) {
      body = bodyMatch[1];
      if (method === "GET") method = "POST";
    }

    return { method, url, headers, body };
  };

  const generateCode = () => {
    const { method, url, headers, body } = parseCurl(curlText);

    if (targetLang === "fetch") {
      let code = `const res = await fetch("${url}", {\n`;
      code += `  method: "${method}",\n`;
      if (Object.keys(headers).length > 0) {
        code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`;
      }
      if (body) {
        code += `  body: JSON.stringify(${body}),\n`;
      }
      code += `});\nconst data = await res.json();\nconsole.log(data);`;
      setGeneratedCode(code);
    } else if (targetLang === "axios") {
      let code = `import axios from "axios";\n\nconst { data } = await axios({\n`;
      code += `  method: "${method.toLowerCase()}",\n`;
      code += `  url: "${url}",\n`;
      if (Object.keys(headers).length > 0) {
        code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`;
      }
      if (body) {
        code += `  data: ${body},\n`;
      }
      code += `});\nconsole.log(data);`;
      setGeneratedCode(code);
    } else if (targetLang === "python") {
      let code = `import requests\n\nurl = "${url}"\n`;
      if (Object.keys(headers).length > 0) {
        code += `headers = ${JSON.stringify(headers, null, 4)}\n`;
      }
      if (body) {
        code += `payload = ${body}\n`;
      }
      code += `response = requests.${method.toLowerCase()}(url${
        Object.keys(headers).length > 0 ? ", headers=headers" : ""
      }${body ? ", json=payload" : ""})\nprint(response.json())`;
      setGeneratedCode(code);
    } else if (targetLang === "go") {
      let code = `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n\t"strings"\n)\n\nfunc main() {\n`;
      code += `\turl := "${url}"\n`;
      if (body) {
        code += `\tpayload := strings.NewReader(\`${body}\`)\n`;
        code += `\treq, _ := http.NewRequest("${method}", url, payload)\n`;
      } else {
        code += `\treq, _ := http.NewRequest("${method}", url, nil)\n`;
      }
      Object.entries(headers).forEach(([k, v]) => {
        code += `\treq.Header.Add("${k}", "${v}")\n`;
      });
      code += `\tres, _ := http.DefaultClient.Do(req)\n\tdefer res.Body.Close()\n\tbody, _ := ioutil.ReadAll(res.Body)\n\tfmt.Println(string(body))\n}`;
      setGeneratedCode(code);
    } else if (targetLang === "php") {
      let code = `<?php\n$curl = curl_init();\ncurl_setopt_array($curl, array(\n`;
      code += `  CURLOPT_URL => '${url}',\n`;
      code += `  CURLOPT_RETURNTRANSFER => true,\n`;
      code += `  CURLOPT_CUSTOMREQUEST => '${method}',\n`;
      if (body) code += `  CURLOPT_POSTFIELDS => '${body}',\n`;
      if (Object.keys(headers).length > 0) {
        code += `  CURLOPT_HTTPHEADER => array(\n`;
        Object.entries(headers).forEach(([k, v]) => {
          code += `    '${k}: ${v}',\n`;
        });
        code += `  ),\n`;
      }
      code += `));\n$response = curl_exec($curl);\ncurl_close($curl);\necho $response;`;
      setGeneratedCode(code);
    }
  };

  useEffect(() => {
    generateCode();
  }, [curlText, targetLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Kod kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-xl mb-3">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span>cURL Multi-Language Converter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          cURL&apos;den Çoklu Dil Kod Üreticisi
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          cURL komutlarını anında JavaScript fetch, Axios, Python requests, Go ve PHP kodlarına dönüştürün.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: cURL Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col h-[560px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>Ham cURL Komutu</span>
              </span>
              <button
                onClick={() => setCurlText(SAMPLE_CURL)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Örnek cURL
              </button>
            </div>

            <textarea
              value={curlText}
              onChange={(e) => setCurlText(e.target.value)}
              placeholder="curl -X GET ..."
              className="flex-1 w-full rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-300 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right 6 Cols: Generated Code */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col h-[560px]">
            {/* Lang Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  { id: "fetch", label: "JS Fetch" },
                  { id: "axios", label: "Axios" },
                  { id: "python", label: "Python" },
                  { id: "go", label: "Go" },
                  { id: "php", label: "PHP" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTargetLang(t.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      targetLang === t.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Kopyala</span>
              </button>
            </div>

            <pre className="flex-1 w-full rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-emerald-300 overflow-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
