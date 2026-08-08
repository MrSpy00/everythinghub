"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Code2,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";

const SAMPLE_SQL = `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

interface ParsedColumn {
  name: string;
  type: string;
  nullable: boolean;
}

export function SQLToTypesClient() {
  const [sql, setSql] = useState(SAMPLE_SQL);
  const [targetLang, setTargetLang] = useState<"ts" | "zod" | "prisma" | "go" | "pydantic">("ts");
  const [outputCode, setOutputCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Parse SQL CREATE TABLE to Intermediate Column Structure
  const parseSqlColumns = (sqlText: string): { tableName: string; cols: ParsedColumn[] } => {
    let tableName = "User";
    const tableMatch = sqlText.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"']?)([a-zA-Z0-9_]+)\1/i);
    if (tableMatch && tableMatch[2]) {
      const raw = tableMatch[2];
      tableName = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/s$/, "");
    }

    const cols: ParsedColumn[] = [];
    const lines = sqlText.split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim().replace(/,$/, "");
      if (
        !trimmed ||
        trimmed.startsWith("--") ||
        trimmed.startsWith("CREATE") ||
        trimmed.startsWith(")") ||
        trimmed.startsWith("PRIMARY KEY") ||
        trimmed.startsWith("KEY") ||
        trimmed.startsWith("CONSTRAINT")
      ) {
        return;
      }

      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const colName = parts[0].replace(/[`"']/g, "");
        const rawType = parts[1].toUpperCase();
        const nullable = !trimmed.toUpperCase().includes("NOT NULL") && !trimmed.toUpperCase().includes("PRIMARY KEY");

        cols.push({
          name: colName,
          type: rawType,
          nullable,
        });
      }
    });

    return { tableName, cols };
  };

  // Convert to specific language
  const generateTypes = () => {
    const { tableName, cols } = parseSqlColumns(sql);

    if (targetLang === "ts") {
      let code = `export interface ${tableName} {\n`;
      cols.forEach((c) => {
        let tsType = "string";
        if (c.type.includes("INT") || c.type.includes("DECIMAL") || c.type.includes("FLOAT") || c.type.includes("DOUBLE")) tsType = "number";
        if (c.type.includes("BOOL")) tsType = "boolean";
        if (c.type.includes("TIME") || c.type.includes("DATE")) tsType = "Date | string";
        if (c.type.includes("JSON")) tsType = "Record<string, unknown>";

        code += `  ${c.name}${c.nullable ? "?" : ""}: ${tsType};\n`;
      });
      code += `}\n`;
      setOutputCode(code);
    } else if (targetLang === "zod") {
      let code = `import { z } from "zod";\n\nexport const ${tableName}Schema = z.object({\n`;
      cols.forEach((c) => {
        let zType = "z.string()";
        if (c.type.includes("INT") || c.type.includes("DECIMAL") || c.type.includes("FLOAT")) zType = "z.number()";
        if (c.type.includes("BOOL")) zType = "z.boolean()";
        if (c.type.includes("TIME") || c.type.includes("DATE")) zType = "z.date().or(z.string())";

        code += `  ${c.name}: ${zType}${c.nullable ? ".optional().nullable()" : ""},\n`;
      });
      code += `});\n\nexport type ${tableName} = z.infer<typeof ${tableName}Schema>;\n`;
      setOutputCode(code);
    } else if (targetLang === "prisma") {
      let code = `model ${tableName} {\n`;
      cols.forEach((c) => {
        let pType = "String";
        if (c.type.includes("INT")) pType = "Int";
        if (c.type.includes("DECIMAL") || c.type.includes("FLOAT")) pType = "Float";
        if (c.type.includes("BOOL")) pType = "Boolean";
        if (c.type.includes("TIME") || c.type.includes("DATE")) pType = "DateTime";

        code += `  ${c.name} ${pType}${c.nullable ? "?" : ""}\n`;
      });
      code += `}\n`;
      setOutputCode(code);
    } else if (targetLang === "go") {
      let code = `type ${tableName} struct {\n`;
      cols.forEach((c) => {
        const goName = c.name
          .split("_")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join("");
        let goType = "string";
        if (c.type.includes("INT")) goType = "int64";
        if (c.type.includes("DECIMAL") || c.type.includes("FLOAT")) goType = "float64";
        if (c.type.includes("BOOL")) goType = "bool";
        if (c.type.includes("TIME") || c.type.includes("DATE")) goType = "time.Time";

        code += `\t${goName} ${c.nullable ? "*" : ""}${goType} \`json:"${c.name}"\`\n`;
      });
      code += `}\n`;
      setOutputCode(code);
    } else if (targetLang === "pydantic") {
      let code = `from pydantic import BaseModel\nfrom typing import Optional\nfrom datetime import datetime\n\nclass ${tableName}(BaseModel):\n`;
      cols.forEach((c) => {
        let pyType = "str";
        if (c.type.includes("INT")) pyType = "int";
        if (c.type.includes("DECIMAL") || c.type.includes("FLOAT")) pyType = "float";
        if (c.type.includes("BOOL")) pyType = "bool";
        if (c.type.includes("TIME") || c.type.includes("DATE")) pyType = "datetime";

        code += `    ${c.name}: ${c.nullable ? `Optional[${pyType}] = None` : pyType}\n`;
      });
      setOutputCode(code);
    }
  };

  useEffect(() => {
    generateTypes();
  }, [sql, targetLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    toast.success("Kod panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <Database className="h-3.5 w-3.5 text-indigo-400" />
          <span>Schema & Type Modeling Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          SQL&apos;den TypeScript, Zod & Prisma Dönüştürücü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          SQL CREATE TABLE sorgularını anında TypeScript interface, Zod doğrulama şeması, Prisma modeli, Go struct ve Python Pydantic kodlarına dönüştürün.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: SQL Editor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                <span>SQL Tablo Tanımı (DDL)</span>
              </span>
              <button
                onClick={() => setSql(SAMPLE_SQL)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
              >
                Örnek Şema
              </button>
            </div>

            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="CREATE TABLE..."
              className="flex-1 w-full rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-indigo-300 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right 6 Cols: Type Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col h-[580px]">
            {/* Lang Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  { id: "ts", label: "TypeScript" },
                  { id: "zod", label: "Zod Schema" },
                  { id: "prisma", label: "Prisma" },
                  { id: "go", label: "Go Struct" },
                  { id: "pydantic", label: "Pydantic" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTargetLang(t.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      targetLang === t.id
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
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
              {outputCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
