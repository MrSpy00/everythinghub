/**
 * aegisFlasher USB Drivers Catalog & Troubleshooting Diagnostics
 */

import { UsbDriverInfo } from "./types";

export const DRIVER_CATALOG: UsbDriverInfo[] = [
  {
    id: "ch340",
    name: "WCH CH340 / CH341 / CH9102",
    chipsets: "CH340G, CH340C, CH340T, CH341A, CH9102F (Klon Arduino, NodeMCU, ESP32 Çin modülleri)",
    vendorIds: ["1A86:7523", "1A86:5523", "1A86:55D4"],
    supportedOS: ["windows", "mac", "linux"],
    description:
      "Dünyada en çok kullanılan USB-Seri dönüştürücüsüdür. Klon Arduino Uno/Nano ve ucuz ESP32 geliştirme kartlarında bulunur.",
    downloadUrlWin: "https://www.wch-ic.com/downloads/CH341SER_EXE.html",
    downloadUrlMac: "https://www.wch-ic.com/downloads/CH341SER_MAC_ZIP.html",
    downloadUrlLinux: "https://www.wch-ic.com/downloads/CH341SER_LINUX_ZIP.html",
    notes:
      "Windows 11/10'da sürücü otomatik yüklenmezse yukarıdaki resmi WCH linkinden CH341SER.EXE'yi indirip 'INSTALL' butonuna basın.",
  },
  {
    id: "cp2102",
    name: "Silicon Labs CP2102 / CP2104 / CP210x",
    chipsets: "CP2102, CP2104, CP2108, CP2109 (Orijinal NodeMCU, ESP32 DevKitC, M5Stack)",
    vendorIds: ["10C4:EA60", "10C4:EA70", "10C4:EA71"],
    supportedOS: ["windows", "mac", "linux"],
    description:
      "Yüksek kararlılıkta ve 921600 / 1500000 baud hızlarını kayıpsız destekleyen profesyonel USB-UART köprüsü.",
    downloadUrlWin: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers",
    downloadUrlMac: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers",
    downloadUrlLinux: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers",
    notes:
      "macOS Sequoia ve Sonoma'da sistem uzantısı izinleri (Security & Privacy) gerekebilir.",
  },
  {
    id: "ftdi",
    name: "FTDI FT232R / FT2232 / FT4232",
    chipsets: "FT232RL, FT232RN, FT2232H, FT4232H (Orijinal Arduino Mega/Nano, ESP-Prog)",
    vendorIds: ["0403:6001", "0403:6010", "0403:6011", "0403:6014"],
    supportedOS: ["windows", "mac", "linux"],
    description:
      "Endüstriyel sınıf FTDI USB-UART ve JTAG hata ayıklayıcı çipleri.",
    downloadUrlWin: "https://ftdichip.com/drivers/vcp-drivers/",
    downloadUrlMac: "https://ftdichip.com/drivers/vcp-drivers/",
    downloadUrlLinux: "https://ftdichip.com/drivers/vcp-drivers/",
    notes:
      "FTDI Virtual COM Port (VCP) sürücüsü çoğu modern işletim sisteminde yerleşiktir.",
  },
  {
    id: "zadig",
    name: "Zadig USB Driver Installer (STM32 & WinUSB)",
    chipsets: "STM32 DFU Bootloader, ST-Link, RTL-SDR, WebUSB aygıtları",
    vendorIds: ["0483:DF11", "0483:3748", "0483:374B"],
    supportedOS: ["windows"],
    description:
      "Windows üzerinde WebUSB veya DFU üzerinden STM32 programlamak için WinUSB sürücüsünü tek tıkla yükler.",
    downloadUrlWin: "https://zadig.akeo.ie/",
    notes:
      "Zadig'i açın -> Options -> 'List All Devices' -> 'STM32 BOOTLOADER' seçin -> Sürücüyü 'WinUSB' olarak değiştirip 'Replace Driver' butonuna tıklayın.",
  },
];

export const TROUBLESHOOTING_TIPS = [
  {
    title: "Sadece Şarj Eden (Şarjsız Veri) USB Kablosu Sorunu",
    description:
      "Birçok telefon şarj kablosunda sadece 5V ve GND telleri bulunur (D+ ve D- veri hatları yoktur). Kartınızın güç ışığı yansa bile bilgisayar 'Cihaz bulunamadı' diyorsa lütfen 4 telli orijinal veri kablosu (Data Cable) kullandığınızdan emin olun.",
  },
  {
    title: "ESP32 'A fatal error occurred: Failed to connect to ESP32' Hatası",
    description:
      "Kartınızda otomatik boot devresi (transistör/kondansatör) zayıfsa: aegisFlasher 'Senkronizasyon deneniyor...' dediği anda kartın üzerindeki 'BOOT' (veya GPIO0) butonuna basılı tutun, 'EN' (Reset) butonuna 1 kez basıp bırakın, ardından BOOT butonunu bırakın.",
  },
  {
    title: "Linux Kullanıcıları İçin Seri Port İzni (Permission Denied)",
    description:
      "Ubuntu, Debian veya Arch Linux üzerinde Web Serial portuna erişim için kullanıcınızı dialout grubuna ekleyin: 'sudo usermod -a -G dialout $USER' komutunu çalıştırıp oturumu kapatıp açın.",
  },
  {
    title: "Başka Programın Portu Kilitlemesi (Resource Busy / In Use)",
    description:
      "Arduino IDE, Cura, Pronterface, PuTTY veya Cura arka planda açıkken seri port kilitlenir. aegisFlasher'a bağlanmadan önce bu uygulamaları kapatın.",
  },
];
