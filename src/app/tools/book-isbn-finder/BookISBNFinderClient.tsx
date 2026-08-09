"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Download,
  Copy,
  Check,
  ArrowLeft,
  Filter,
  Eye,
  RefreshCw,
  Share2,
  FileText,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FluidSlimeCard } from "@/components/creative/FluidSlimeCard";

export interface BookItem {
  id: string;
  title: string;
  authors: string[];
  publishYear?: number | string;
  isbn10?: string;
  isbn13?: string;
  coverUrl?: string;
  hdCoverUrl?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  description?: string;
  categories?: string[];
  previewLink?: string;
  source: "OpenLibrary" | "GoogleBooks";
}

export function BookISBNFinderClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [query, setQuery] = useState("Dune");
  const [searchType, setSearchType] = useState<"all" | "title" | "author" | "isbn">("all");
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [copiedIsbn, setCopiedIsbn] = useState<string | null>(null);
  const [filterWithCover, setFilterWithCover] = useState(false);

  // Fast Dual-Source Search Engine (Open Library + Google Books)
  const executeSearch = useCallback(
    async (searchTerm: string, type: "all" | "title" | "author" | "isbn") => {
      const cleanTerm = searchTerm.trim();
      if (!cleanTerm) return;

      setLoading(true);
      const results: BookItem[] = [];

      try {
        // 1. Query Google Books API (High speed, crisp covers and summaries)
        let gbQuery = encodeURIComponent(cleanTerm);
        if (type === "title") gbQuery = `intitle:${encodeURIComponent(cleanTerm)}`;
        else if (type === "author") gbQuery = `inauthor:${encodeURIComponent(cleanTerm)}`;
        else if (type === "isbn") gbQuery = `isbn:${encodeURIComponent(cleanTerm.replace(/[-\s]/g, ""))}`;

        const gbPromise = fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${gbQuery}&maxResults=20&printType=books`
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        // 2. Query Open Library API (20M+ historical catalog)
        let olParam = `q=${encodeURIComponent(cleanTerm)}`;
        if (type === "title") olParam = `title=${encodeURIComponent(cleanTerm)}`;
        else if (type === "author") olParam = `author=${encodeURIComponent(cleanTerm)}`;
        else if (type === "isbn") olParam = `isbn=${encodeURIComponent(cleanTerm.replace(/[-\s]/g, ""))}`;

        const olPromise = fetch(`https://openlibrary.org/search.json?${olParam}&limit=20`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        const [gbData, olData] = await Promise.all([gbPromise, olPromise]);

        // Parse Google Books Results
        if (gbData?.items && Array.isArray(gbData.items)) {
          gbData.items.forEach((item: any) => {
            const info = item.volumeInfo || {};
            const isbns = info.industryIdentifiers || [];
            const isbn13 = isbns.find((i: any) => i.type === "ISBN_13")?.identifier;
            const isbn10 = isbns.find((i: any) => i.type === "ISBN_10")?.identifier;

            const thumb = info.imageLinks?.thumbnail?.replace("http://", "https://");
            const largeCover =
              info.imageLinks?.extraLarge?.replace("http://", "https://") ||
              info.imageLinks?.large?.replace("http://", "https://") ||
              info.imageLinks?.medium?.replace("http://", "https://") ||
              thumb?.replace("&zoom=1", "&zoom=2");

            results.push({
              id: item.id || `gb-${Math.random()}`,
              title: info.title || "Untitled Book",
              authors: info.authors || [isTurkish ? "Bilinmeyen Yazar" : "Unknown Author"],
              publishYear: info.publishedDate?.split("-")?.[0] || undefined,
              isbn10,
              isbn13,
              coverUrl: thumb,
              hdCoverUrl: largeCover || thumb,
              publisher: info.publisher,
              pageCount: info.pageCount,
              language: info.language?.toUpperCase(),
              description: info.description,
              categories: info.categories,
              previewLink: info.previewLink || info.infoLink,
              source: "GoogleBooks",
            });
          });
        }

        // Parse Open Library Results
        if (olData?.docs && Array.isArray(olData.docs)) {
          olData.docs.forEach((doc: any) => {
            const coverId = doc.cover_i;
            const isbnList = doc.isbn || [];
            const isbn13 = isbnList.find((i: string) => i.length === 13) || isbnList[0];
            const isbn10 = isbnList.find((i: string) => i.length === 10);

            const cover = coverId
              ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
              : isbn13
              ? `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`
              : undefined;

            const hdCover = coverId
              ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
              : isbn13
              ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`
              : undefined;

            // Avoid direct duplicates
            const isDuplicate = results.some(
              (r) => r.title.toLowerCase() === (doc.title || "").toLowerCase()
            );

            if (!isDuplicate) {
              results.push({
                id: doc.key || `ol-${Math.random()}`,
                title: doc.title || "Untitled Book",
                authors: doc.author_name || [isTurkish ? "Bilinmeyen Yazar" : "Unknown Author"],
                publishYear: doc.first_publish_year,
                isbn10,
                isbn13,
                coverUrl: cover,
                hdCoverUrl: hdCover || cover,
                publisher: doc.publisher?.[0],
                pageCount: doc.number_of_pages_median,
                language: doc.language?.[0]?.toUpperCase(),
                description: undefined,
                categories: doc.subject?.slice(0, 3),
                previewLink: `https://openlibrary.org${doc.key}`,
                source: "OpenLibrary",
              });
            }
          });
        }

        setBooks(results);
        if (results.length === 0) {
          toast.warning(isTurkish ? "Kitap bulunamadı." : "No books found matching query.");
        }
      } catch (err) {
        toast.error(isTurkish ? "Arama servisi geçici olarak yanıt vermedi." : "Search service error.");
      } finally {
        setLoading(false);
      }
    },
    [isTurkish]
  );

  useEffect(() => {
    executeSearch("Dune", "title");
  }, [executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, searchType);
  };

  const handleCopyIsbn = async (isbn: string) => {
    const ok = await copyToClipboard(isbn);
    if (ok) {
      setCopiedIsbn(isbn);
      toast.success(`${isbn} ${isTurkish ? "kopyalandı!" : "copied!"}`);
      setTimeout(() => setCopiedIsbn(null), 2000);
    }
  };

  // Download High-Res Cover
  const handleDownloadCover = async (coverUrl: string, title: string) => {
    try {
      const response = await fetch(coverUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover_${title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(isTurkish ? "HD Kapak görseli indirildi!" : "HD Cover downloaded!");
    } catch {
      window.open(coverUrl, "_blank");
    }
  };

  const displayedBooks = useMemo(() => {
    if (!filterWithCover) return books;
    return books.filter((b) => Boolean(b.coverUrl));
  }, [books, filterWithCover]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] backdrop-blur-xl transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-400" />
          <span>{isTurkish ? "Hub Menüsüne Dön" : "Back to Hub"}</span>
        </Link>
        <span className="text-xs font-mono text-zinc-400 bg-white/[0.03] border border-white/10 px-3 py-1 rounded-xl">
          Open Library & Google Books Multi-Engine
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-xl">
          <BookOpen className="h-4 w-4 text-amber-400" />
          <span>{isTurkish ? "Evrensel Kitap, Yazar & ISBN Katalog Stüdyosu" : "Universal Book & ISBN Search Pro"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "Açık Kitaplık & ISBN Arama Motoru" : "Open Library & ISBN Search Engine"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "Kitap adı, yazar veya ISBN numarası ile anında yayın yılı, sayfa sayısı, yayıncı, açıklamalar ve yüksek çözünürlüklü kapak görsellerine ulaşın."
            : "Search books, authors, and ISBNs instantly with dual-engine accuracy, high-res covers, page counts, and metadata."}
        </p>
      </div>

      {/* Search Bar & Mode Pills */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "all", label: isTurkish ? "Tümü (Genel Arama)" : "All Fields" },
            { id: "title", label: isTurkish ? "Kitap Adı" : "Book Title" },
            { id: "author", label: isTurkish ? "Yazar Adı" : "Author Name" },
            { id: "isbn", label: isTurkish ? "ISBN-10 / ISBN-13" : "ISBN Number" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSearchType(t.id as any);
                executeSearch(query, t.id as any);
              }}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                searchType === t.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10"
                  : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === "isbn"
                  ? isTurkish ? "Örn: 9780441172719..." : "e.g. 9780441172719..."
                  : searchType === "author"
                  ? isTurkish ? "Örn: Frank Herbert, George Orwell..." : "e.g. Frank Herbert, George Orwell..."
                  : isTurkish ? "Kitap adı, yazar veya ISBN girin..." : "Enter book title, author, or ISBN..."
              }
              className="w-full rounded-2xl border border-white/10 bg-[#0d0e12]/95 py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none backdrop-blur-3xl shadow-2xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 px-6 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all shrink-0 cursor-pointer shadow-lg shadow-amber-500/10 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{loading ? (isTurkish ? "Aranıyor..." : "Searching...") : isTurkish ? "Kitap Ara" : "Search"}</span>
          </button>
        </form>

        {/* Quick Filter Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 px-1">
          <span className="font-mono">{displayedBooks.length} {isTurkish ? "Kitap Listeleniyor" : "Books Listed"}</span>
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={filterWithCover}
              onChange={(e) => setFilterWithCover(e.target.checked)}
              className="rounded accent-amber-500 h-3.5 w-3.5"
            />
            <span>{isTurkish ? "Yalnızca Görselli Kitaplar" : "Only with Covers"}</span>
          </label>
        </div>
      </div>

      {/* Book Grid Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedBooks.map((book) => (
          <FluidSlimeCard
            key={book.id}
            glowColor="rgba(245, 158, 11, 0.25)"
            className="p-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Cover Display */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group/cover">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                    <BookMarked className="h-12 w-12 mb-2 opacity-40 text-amber-400" />
                    <span className="text-xs font-semibold">{isTurkish ? "Kapak Görseli Yok" : "No Cover Art"}</span>
                  </div>
                )}

                {/* Quick Action Overlay */}
                {book.coverUrl && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => handleDownloadCover(book.hdCoverUrl || book.coverUrl!, book.title)}
                      className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                      title={isTurkish ? "HD Kapak Görselini İndir" : "Download HD Cover"}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <a
                      href={book.hdCoverUrl || book.coverUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.2] transition-all cursor-pointer"
                      title={isTurkish ? "Yeni Sekmede Görseli Aç" : "Open Cover in New Tab"}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Title & Author */}
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                  {book.authors.join(", ")}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
                {book.publishYear && (
                  <span className="flex items-center gap-1 bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded-md">
                    <Calendar className="h-3 w-3 text-amber-400" />
                    {book.publishYear}
                  </span>
                )}
                {book.pageCount && (
                  <span className="flex items-center gap-1 bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded-md">
                    <FileText className="h-3 w-3 text-indigo-400" />
                    {book.pageCount} {isTurkish ? "Sayfa" : "p."}
                  </span>
                )}
                {book.language && (
                  <span className="bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded-md">
                    {book.language}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions & ISBN */}
            <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
              {(book.isbn13 || book.isbn10) && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400 text-[11px]">
                    ISBN: <span className="text-white font-bold">{book.isbn13 || book.isbn10}</span>
                  </span>
                  <button
                    onClick={() => handleCopyIsbn(book.isbn13 || book.isbn10!)}
                    className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title={isTurkish ? "ISBN Kopyala" : "Copy ISBN"}
                  >
                    {copiedIsbn === (book.isbn13 || book.isbn10) ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}

              {book.previewLink && (
                <a
                  href={book.previewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isTurkish ? "Kitap Detayı & Önizleme" : "Book Details & Preview"}</span>
                </a>
              )}
            </div>
          </FluidSlimeCard>
        ))}
      </div>
    </div>
  );
}
