"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Users,
  Calendar,
  Layers,
  ExternalLink,
  BookMarked,
  Sparkles,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { searchOpenLibrary, type BookSearchResult } from "@/lib/api-clients";

export function BookISBNFinderClient() {
  const [query, setQuery] = useState("The Lord of the Rings");
  const [searchType, setSearchType] = useState<"title" | "author" | "isbn">("title");
  const [books, setBooks] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (val: string, type: "title" | "author" | "isbn") => {
    if (!val.trim()) return;
    setLoading(true);
    try {
      const results = await searchOpenLibrary(val, type);
      setBooks(results);
      if (results.length === 0) {
        toast.warning("Kitap bulunamadı.");
      }
    } catch (err) {
      toast.error("Kitap arama servisine ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch("The Lord of the Rings", "title");
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xl mb-3">
          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
          <span>Open Library 20M+ Global Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Açık Kitaplık & ISBN Arama Motoru
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Kitap adı, yazar veya ISBN numarası ile anında yayın yılı, sayfa sayısı, yayıncı ve yüksek çözünürlüklü kapak görsellerini bulun.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8 space-y-3">
        <div className="flex justify-center gap-2">
          {[
            { id: "title", label: "Kitap Adı" },
            { id: "author", label: "Yazar" },
            { id: "isbn", label: "ISBN No" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSearchType(t.id as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                searchType === t.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query, searchType);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kitap başlığı, yazar veya ISBN girin..."
              className="w-full rounded-2xl border border-white/10 bg-[#0d0e12]/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none backdrop-blur-2xl shadow-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 px-5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-all shrink-0"
          >
            <span>{loading ? "Aranıyor..." : "Kitap Ara"}</span>
          </button>
        </form>
      </div>

      {/* Book Grid Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book, idx) => {
          const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null;

          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-5 shadow-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group"
            >
              <div className="space-y-4">
                {/* Cover Box */}
                <div className="h-56 w-full rounded-xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center relative">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BookMarked className="h-12 w-12 text-zinc-700" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                    <Users className="h-3 w-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{book.author_name?.join(", ") || "Bilinmiyor"}</span>
                  </p>
                </div>
              </div>

              {/* Meta details */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-[11px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>İlk Basım:</span>
                  <span className="text-zinc-200">{book.first_publish_year || "—"}</span>
                </div>
                {book.number_of_pages_median && (
                  <div className="flex justify-between">
                    <span>Sayfa Sayısı:</span>
                    <span className="text-zinc-200">{book.number_of_pages_median}</span>
                  </div>
                )}
                {book.isbn && book.isbn[0] && (
                  <div className="flex justify-between">
                    <span>ISBN:</span>
                    <span className="text-amber-400/80 truncate max-w-[120px]">{book.isbn[0]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
