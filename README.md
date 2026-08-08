# ⚡ everythinghub

<div align="center">

![everythinghub banner](https://img.shields.io/badge/everythinghub-Studio_v1.0-8b5cf6?style=for-the-badge&logo=rocket&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

<p align="center">
  <strong>Modern, ultra hızlı, login gerektirmeyen, gizlilik odaklı hepsi-bir-arada dijital araçlar stüdyosu.</strong><br>
  <em>Modern, ultra-fast, zero-login, privacy-first all-in-one digital tools studio.</em>
</p>

[🇹🇷 Türkçe Dokümantasyon](#-türkçe-dokümantasyon) • [🇬🇧 English Documentation](#-english-documentation) • [🚀 Canlı Demo](#) • [💻 Windows Konsolu](#-windows-akıllı-konsol-serverbat)

---

</div>

---

# 🇹🇷 Türkçe Dokümantasyon

## 📖 Proje Hakkında & Vizyon

**everythinghub**, modern web teknolojileri (Next.js 16 Turbopack, React 19, Tailwind CSS v4, OGL WebGL ve Framer Motion) ile inşa edilmiş, kayıt veya üyelik gerektirmeyen, tamamen ücretsiz ve açık kaynaklı bir dijital araçlar platformudur.

Platform, geleneksel yapay zeka klonu veya karmaşık sitelerin aksine; **Originkit kreatif stüdyo estetiği**, etkileşimli WebGL kromatik nokta dalgaları (Dotted Waves), akışkan takipçi imleç (Spring UserCursor), neon ışıma efektleri ve kinetik tipografi ile donatılmıştır.

### 🌟 Temel Değerler & İlkeler
1. **Sıfır Veri Saklama (Zero Data Retention):** Tüm işlemler tarayıcı tarafında veya anlık bellek üzerinden gerçekleştirilir. Çerezler, veritabanı kayıtları veya kullanıcı takip mekanizmaları bulunmaz.
2. **Kayıt / Login Zorunluluğu Yok:** Kredi kartı, API anahtarı veya e-posta istemez.
3. **Işık Hızında Performans:** Next.js 16 Turbopack motoru ve OGL WebGL donanım hızlandırması sayesinde sıfır gecikmeyle çalışır.
4. **Kapsamlı Loglama & Hata Takibi:** Dahili telemetri ve sistem tanılama (`/api/diagnostics`) motoru barındırır.

---

## ✨ Canlı ve Geliştirilmekte Olan Araçlar

### 🎬 1. YouTube Playlist Analyzer (`/tools/yt-playlist-length`) — [AKTİF / LIVE]
* **Playlist Süresi Hesaplama:** YouTube oynatma listesindeki tüm videoların sürelerini saniyeler içinde hesaplar.
* **Farklı Hızlarda İzleme Simülasyonu:** 1.0x, 1.25x, 1.5x, 1.75x ve 2.0x hızlarında listenin ne kadar sürede biteceğini gösterir.
* **Çok Katmanlı API & RSS Motoru:** YouTube InnerTube API'si ile çalışır, herhangi bir kota kısıtlamasında otomatik olarak Google RSS akışına geçer.
* **Thumbnail İndirici:** Oynatma listesindeki videoların yüksek çözünürlüklü kapak görsellerini tek tıkla görüntüleme ve indirme imkanı.

### 🖼️ 2. Görsel Sıkıştırıcı (`image-compressor`) — [Geliştirilme Aşamasında]
* Kalite kaybı olmadan PNG, JPEG ve WebP formatlarını doğrudan tarayıcıda optimize eder.

### ⚙️ 3. JSON Formatlayıcı & Doğrulayıcı (`json-formatter`) — [Geliştirilme Aşamasında]
* Büyük JSON dosyalarını anında formatlar, sözdizimi hatalarını satır bazında vurgular.

### 🎨 4. Renk Paleti & Gradient Üretici (`color-picker`) — [Geliştirilme Aşamasında]
* Görsellerden renk paleti çıkarma ve CSS3 uyumlu yumuşak gradient kodları üretme aracı.

---

## 🖥️ Windows Akıllı Konsol (`server.bat`)

Projeyi Windows ortamında tek tıkla çalıştırmak, yönetmek ve test etmek için geliştirilmiş akıllı yönetim konsoludur:

```cmd
====================================================================
           EVERYTHINGHUB - SMART MANAGEMENT CONSOLE
====================================================================
 [1] Next.js Gelistirme Sunucusu (dev - Port 3000)
 [2] Hizli Port Temizleyici (Port 3000'i zorla bosalt)
 [3] Next.js Production Build (build)
 [4] Production Sunucusu Calistir (start)
 [5] Kod Kalitesi ve ESLint Kontrolu (lint)
 [6] Bagimliliklari Temizle ve Bastan Kur (clean install)
 [7] Sistem ve Node/NPM Durum Raporu
 [8] Cikis
====================================================================
```

* **Tek Tuşla İşlem:** `choice` komutu sayesinde Enter'a basmaya gerek kalmadan doğrudan menü seçimi yapılabilir.
* **Port Çakışma Önleyici:** Port 3000 dolu olduğunda süreci tek tıkla sonlandırır.
* **Çift Tıklama Koruması:** `cd /d "%~dp0"` ve UTF-8 kodlama sayesinde Windows Gezgini'nden çift tıklandığında anında kapanmaz.

---

## 🏗️ Mimari & Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.0 | Turbopack destekli modern App Router |
| **Kütüphane** | React 19.2.8 | Eşzamanlı render ve optimize Server Components |
| **Stil / CSS** | Tailwind CSS v4.0 | Modern değişken tabanlı renk ve düzen sistemi |
| **WebGL Grafikleri** | OGL 1.0.11 | Perlin noise tabanlı kromatik nokta dalgası animasyonu |
| **Animasyon** | Framer Motion 13 | Yay fizikli imleç takipçisi, neon ışıma ve sürükleme |
| **Arama Motoru** | Fuse.js 7.5.0 | Anında ve toleranslı bulanık arama |
| **Bildirimler** | Sonner 2.0.7 | Modern tost bildirimleri |

---

## 🚀 Kurulum ve Yerel Geliştirme

Projeyi yerel makinenizde çalıştırmak için:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/MrSpy00/everythinghub.git
cd everythinghub

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev

# veya Windows kullanıyorsanız:
server.bat
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 👥 Tasarım, Geliştirme & Telif Hakkı

* **Proje Sahibi:** [@MrSpy00](https://github.com/MrSpy00)
* **Kaynak Kod Deposu:** [everythinghub GitHub](https://github.com/MrSpy00/everythinghub)
* **Tasarım ve Geliştirme:** [aegisSoft](https://www.aegissoft.com.tr/)
* **Telif Hakkı:** `aegisSoft Tüm hakları saklıdır.`

---

<br><br>

# 🇬🇧 English Documentation

## 📖 About & Vision

**everythinghub** is a modern, high-performance, privacy-first all-in-one digital utility hub built with Next.js 16 Turbopack, React 19, Tailwind CSS v4, OGL WebGL, and Framer Motion.

Instead of looking like a generic AI wrapper or standard dashboard, **everythinghub** embraces a **creative studio aesthetic** inspired by Originkit — featuring GPU-accelerated chromatic dotted waves, a spring-physics follower cursor (`UserCursor`), sweeping violet/indigo neon borders, and kinetic typography.

### 🌟 Core Philosophy
1. **Zero Data Retention:** Everything runs strictly client-side or in-memory. No databases, no user trackers, no personal data collection.
2. **Zero Login / Authentication:** Free forever, no registration, no API keys, no credit cards required.
3. **Instantaneous Performance:** Powered by Turbopack compilation and lightweight WebGL rendering.
4. **Built-in Diagnostics:** Complete logging and telemetry engine (`/api/diagnostics`) to track latencies and system health without privacy compromises.

---

## ✨ Available & Upcoming Tools

### 🎬 1. YouTube Playlist Analyzer (`/tools/yt-playlist-length`) — [LIVE]
* **Accurate Playlist Duration:** Computes exact video duration for playlists up to hundreds of videos.
* **Speed Multipliers:** Shows exact watch time for 1.0x, 1.25x, 1.5x, 1.75x, and 2.0x playback speeds.
* **Dual Fetch Engine:** Uses YouTube InnerTube client with automatic fallback to Google RSS feeds.
* **Thumbnail Browser & Downloader:** Instant access to high-res video thumbnails.

### 🖼️ 2. Image Compressor (`image-compressor`) — [Coming Soon]
* Lossless and lossy compression for PNG, JPEG, and WebP formats processed 100% in the browser.

### ⚙️ 3. JSON Formatter & Validator (`json-formatter`) — [Coming Soon]
* Real-time JSON tree viewer, beautifier, minifier, and error highlighter.

### 🎨 4. Palette & Gradient Studio (`color-picker`) — [Coming Soon]
* Image color extractor and CSS3 gradient generator with one-click export.

---

## 🖥️ Windows Smart Console (`server.bat`)

A specialized Windows command-line utility for managing local dev servers, ports, and builds:

```cmd
====================================================================
           EVERYTHINGHUB - SMART MANAGEMENT CONSOLE
====================================================================
 [1] Next.js Development Server (dev - Port 3000)
 [2] Force Port 3000 Cleanup
 [3] Next.js Production Build (build)
 [4] Start Production Server (start)
 [5] Code Quality & ESLint Check (lint)
 [6] Clean & Reinstall Dependencies (clean install)
 [7] System, Node & NPM Diagnostics
 [8] Exit
====================================================================
```

* **Instant Key Detection:** Uses native Windows `choice` command for instant keypress triggers.
* **Port Resolver:** Automatically frees up port 3000 if occupied.
* **Explorer Friendly:** Robust path resolution (`cd /d "%~dp0"`) prevents accidental double-click termination.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.0 | Turbopack App Router with Server & Client components |
| **Runtime** | React 19.2.8 | Concurrent features and optimized hydration |
| **Styling** | Tailwind CSS v4.0 | Modern utility classes & HSL/Hex theme tokens |
| **Graphics** | OGL 1.0.11 | Minimal WebGL library for Perlin noise chromatic dots |
| **Physics** | Framer Motion 13 | Smooth cursor trailing, velocity tilt, and kinetic layout |
| **Search Engine** | Fuse.js 7.5.0 | In-memory fuzzy search with scoring |
| **Notifications** | Sonner 2.0.7 | Accessible, animated toast notifications |

---

## 🚀 Setup & Local Development

To run everythinghub locally:

```bash
# 1. Clone repository
git clone https://github.com/MrSpy00/everythinghub.git
cd everythinghub

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# or on Windows:
server.bat
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Credits, Attribution & Copyright

* **Author & Maintainer:** [@MrSpy00](https://github.com/MrSpy00)
* **Official Repository:** [everythinghub GitHub Repository](https://github.com/MrSpy00/everythinghub)
* **Design and Development:** [aegisSoft](https://www.aegissoft.com.tr/)
* **Copyright:** `aegisSoft Tüm hakları saklıdır.` / `All rights reserved.`

<div align="center">
  <br>
  <sub>Built with ❤️ by aegisSoft and MrSpy00. EverythingHub is licensed under MIT.</sub>
</div>
