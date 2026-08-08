# 🌟 EverythingHub

> **Her Şeyin Merkezi** — Ücretsiz, modern, hızlı ve login gerektirmeyen hepsi-bir-arada web araçları platformu.

![EverythingHub](https://raw.githubusercontent.com/MrSpy00/everythinghub/main/public/globe.svg)

---

## 🚀 Özellikler

- 🎬 **YouTube Playlist Analyzer**: Playlist toplam süresi, hız çarpanı analizi (1.25x, 1.5x, 2x kazanç hesaplama), CSV dışa aktarma ve yüksek çözünürlüklü thumbnail indirme.
- ⚡ **Yüksek Performans**: Next.js 16 (App Router & Turbopack), React 19 ve Tailwind CSS v4 ile ışık hızında kullanıcı deneyimi.
- 🎨 **Modern & Estetik Arayüz**: Aurora arka plan efektleri, akıcı Framer Motion animasyonları, koyu tema ve Lucide ikonları.
- 🔒 **Gizlilik & Güvenlik**: Sıfır hesap gereksinimi, istemci taraflı & gizlilik odaklı işlem altyapısı.
- 🛠️ **Akıllı Yönetim Konsolu (`server.bat`)**: Windows için port çakışması çözücü, tek tıkla dev/build/lint/doctor ve tam sistem temizleme araçları.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Windows Akıllı Konsol (Önerilen)
Proje kök dizininde `server.bat` dosyasını çalıştırın veya çift tıklayın:
```cmd
server.bat
```
Doğrudan komutla çalıştırmak için:
```cmd
server.bat dev        # Turbopack dev sunucusunu başlatır
server.bat build      # Production optimize build alır
server.bat start      # Canlı sunucuyu başlatır
server.bat lint       # ESLint kod kalitesi kontrolü
server.bat doctor     # Sistem ve bağımlılık sağlık raporu
server.bat clean      # Önbellekleri temizler
```

### 2. Standart npm Komutları
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build al
npm run build

# Production sunucusunu başlat
npm run start

# ESLint kontrolü
npm run lint
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## 📁 Proje Yapısı

```
everythinghub/
├── src/
│   ├── app/
│   │   ├── api/tools/yt-playlist/   # Playlist ayrıştırma API route'u
│   │   ├── tools/yt-playlist-length/ # YouTube Playlist aracı sayfası
│   │   ├── globals.css              # Global tema ve stiller
│   │   ├── layout.tsx               # Root layout & SEO meta
│   │   └── page.tsx                 # Ana sayfa & araç vitrini
│   ├── components/
│   │   ├── hub/                     # Vitrin ve araç kartı bileşenleri
│   │   └── shared/                  # Header, Footer, Aurora efektleri
│   └── lib/
│       ├── tools-registry.ts        # Araç kataloğu ve kategori tanımları
│       └── utils.ts                 # Süre formatlama ve yardımcı fonksiyonlar
├── public/                          # Statik görseller ve varlıklar
├── .gitignore                       # Kapsamlı güvenlik ve gizlilik kuralları
├── server.bat                       # Akıllı Windows geliştirme sunucusu
└── package.json
```

---

## 📜 Lisans & Katkı

Bu proje açık kaynaklıdır. Katkıda bulunmak için issue açabilir veya Pull Request gönderebilirsiniz.
