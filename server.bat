@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: =============================================================================
::  everythinghub — Akıllı ve Gelişmiş Geliştirme & Yönetim Konsolu (server.bat)
:: =============================================================================

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "LOG_DIR=%PROJECT_DIR%\logs"
set "NODE_MODULES=%PROJECT_DIR%\node_modules"
set "NEXT_DIR=%PROJECT_DIR%\.next"
set "DEFAULT_PORT=3000"
set "PORT=%DEFAULT_PORT%"

:: ANSI Renk Tanımları
set "ESC="
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "MAGENTA=%ESC%[95m"
set "CYAN=%ESC%[96m"
set "WHITE=%ESC%[97m"
set "BOLD=%ESC%[1m"
set "DIM=%ESC%[2m"
set "RESET=%ESC%[0m"

:: Parametre Kontrolü
set "ARG1=%~1"
set "ARG2=%~2"

if not "%ARG1%"=="" (
    if /i "%ARG1%"=="dev"        goto :cmd_dev
    if /i "%ARG1%"=="build"      goto :cmd_build
    if /i "%ARG1%"=="start"      goto :cmd_start
    if /i "%ARG1%"=="lint"       goto :cmd_lint
    if /i "%ARG1%"=="typecheck"  goto :cmd_typecheck
    if /i "%ARG1%"=="check"      goto :cmd_check
    if /i "%ARG1%"=="doctor"     goto :cmd_doctor
    if /i "%ARG1%"=="clean"      goto :cmd_clean
    if /i "%ARG1%"=="reset"      goto :cmd_reset
    if /i "%ARG1%"=="install"    goto :cmd_install
    if /i "%ARG1%"=="kill-port"  goto :cmd_kill_port
    if /i "%ARG1%"=="git"        goto :cmd_git_status
    if /i "%ARG1%"=="help"       goto :show_help
    if /i "%ARG1%"=="--help"     goto :show_help
    if /i "%ARG1%"=="-h"         goto :show_help
    
    echo %RED%[HATA] Geçersiz parametre: %ARG1%%RESET%
    goto :show_help
)

:: ── Ana İnteraktif Menü ───────────────────────────────────────────────────────
:main_menu
cls
call :print_banner
echo  %BOLD%%WHITE%Lütfen yapmak istediğiniz işlemi seçin:%RESET%
echo.
echo   %CYAN%[1]%RESET%  %GREEN%🚀 Geliştirme Sunucusu%RESET%       %DIM%(Next.js Turbopack dev server - http://localhost:%PORT%)%RESET%
echo   %CYAN%[2]%RESET%  %BLUE%🏗️  Production Build%RESET%          %DIM%(TypeScript ve Next.js optimize derleme)%RESET%
echo   %CYAN%[3]%RESET%  %MAGENTA%⚡ Production Sunucusu%RESET%        %DIM%(Build doğrula ve canlı modda başlat)%RESET%
echo   %CYAN%[4]%RESET%  %YELLOW%🔍 Kod Kalite ve Lint%RESET%         %DIM%(ESLint ve TypeScript kontrolleri)%RESET%
echo   %CYAN%[5]%RESET%  %CYAN%🩺 Sistem Sağlık Kontrolü%RESET%     %DIM%(Node.js, npm, Git, bağımlılık kontrolü)%RESET%
echo   %CYAN%[6]%RESET%  %WHITE%🧹 Cache & Log Temizle%RESET%       %DIM%(.next, .turbo, log ve geçici dosyaları sil)%RESET%
echo   %CYAN%[7]%RESET%  %RED%🔄 Sıfır Kurulum (Reset)%RESET%      %DIM%(node_modules ve tüm cache'i temizleyip yeniden kur)%RESET%
echo   %CYAN%[8]%RESET%  %YELLOW%🔌 Port ve Süreç Yöneticisi%RESET%   %DIM%(Port çakışmalarını tespit et ve sonlandır)%RESET%
echo   %CYAN%[9]%RESET%  %BLUE%📦 Git Hızlı Durum%RESET%            %DIM%(Branch, commit ve remote senkronizasyon)%RESET%
echo   %CYAN%[0]%RESET%  %DIM%🚪 Çıkış%RESET%
echo.
echo %MAGENTA%─────────────────────────────────────────────────────────────────────────────%RESET%
set /p "CHOICE=Seçiminiz [1-9, 0]: "

if "%CHOICE%"=="1" goto :cmd_dev
if "%CHOICE%"=="2" goto :cmd_build
if "%CHOICE%"=="3" goto :cmd_start
if "%CHOICE%"=="4" goto :cmd_lint
if "%CHOICE%"=="5" goto :cmd_doctor
if "%CHOICE%"=="6" goto :cmd_clean
if "%CHOICE%"=="7" goto :cmd_reset
if "%CHOICE%"=="8" goto :cmd_port_manager
if "%CHOICE%"=="9" goto :cmd_git_status
if "%CHOICE%"=="0" goto :graceful_exit

echo.
echo %RED%Geçersiz seçim! Lütfen menüdeki numaralardan birini girin.%RESET%
timeout /t 2 >nul
goto :main_menu

:: ── Banner ───────────────────────────────────────────────────────────────────
:print_banner
echo.
echo %CYAN%  ███████╗██╗   ██╗███████╗██████╗ ██╗   ██╗████████╗██╗  ██╗██╗███╗   ██╗ ██████╗ %RESET%
echo %CYAN%  ██╔════╝██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝╚══██╔══╝██║  ██║██║████╗  ██║██╔════╝ %RESET%
echo %CYAN%  █████╗  ██║   ██║█████╗  ██████╔╝ ╚████╔╝    ██║   ███████║██║██╔██╗ ██║██║  ███╗%RESET%
echo %CYAN%  ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗  ╚██╔╝     ██║   ██╔══██║██║██║╚██╗██║██║   ██║%RESET%
echo %CYAN%  ███████╗ ╚████╔╝ ███████╗██║  ██║   ██║      ██║   ██║  ██║██║██║ ╚████║╚██████╔╝%RESET%
echo %CYAN%  ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ %RESET%
echo.
echo %WHITE%                       EverythingHub — Akıllı Geliştirme Konsolu%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────────────────────────────%RESET%
echo.
exit /b 0

:: ── Sistem ve Bağımlılık Kontrolleri ─────────────────────────────────────────
:verify_prerequisites
echo %BLUE%[1/2] Sistem bileşenleri kontrol ediliyor...%RESET%

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[✗] Node.js bulunamadı! Lütfen https://nodejs.org adresinden kurun.%RESET%
    goto :fatal
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[✗] npm bulunamadı!%RESET%
    goto :fatal
)

if not exist "%NODE_MODULES%" (
    echo %YELLOW%[!] node_modules bulunamadı. Bağımlılıklar otomatik yükleniyor...%RESET%
    call :cmd_install_silent
)

if not exist "%NODE_MODULES%\next" (
    echo %YELLOW%[!] Next.js paketi eksik. npm install çalıştırılıyor...%RESET%
    call :cmd_install_silent
)

echo %GREEN%[✓] Sistem ve bağımlılıklar hazır.%RESET%
exit /b 0

:: ── Port Kontrolü ve Çözümü ──────────────────────────────────────────────────
:check_and_resolve_port
set "TARGET_PORT=%~1"
if "%TARGET_PORT%"=="" set "TARGET_PORT=%DEFAULT_PORT%"

echo %BLUE%[2/2] Port %TARGET_PORT% durumu denetleniyor...%RESET%
netstat -ano | findstr /R /C:":%TARGET_PORT% .*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo %YELLOW%[!] Port %TARGET_PORT% şu anda başka bir süreç tarafından kullanılıyor!%RESET%
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":%TARGET_PORT% .*LISTENING"') do (
        set "PID_OCCUPIED=%%p"
    )
    echo %YELLOW%    Kullanan Süreç PID: !PID_OCCUPIED!%RESET%
    echo.
    echo %WHITE%    Seçenekler:%RESET%
    echo     [K] Bu süreci sonlandır (Kill PID !PID_OCCUPIED!) ve %TARGET_PORT% portunda devam et
    echo     [D] Otomatik olarak sonraki porta geç (Port 3001)
    echo     [I] İptal et ve menüye dön
    echo.
    set /p "PORT_CHOICE=Seçiminiz (K/D/I) [Varsayılan: K]: "
    if /i "!PORT_CHOICE!"=="I" goto :main_menu
    if /i "!PORT_CHOICE!"=="D" (
        set "PORT=3001"
        echo %GREEN%[✓] Port 3001 olarak ayarlandı.%RESET%
    ) else (
        echo %YELLOW%    PID !PID_OCCUPIED! sonlandırılıyor...%RESET%
        taskkill /F /PID !PID_OCCUPIED! >nul 2>&1
        timeout /t 1 >nul
        echo %GREEN%[✓] Port %TARGET_PORT% serbest bırakıldı.%RESET%
        set "PORT=%TARGET_PORT%"
    )
) else (
    echo %GREEN%[✓] Port %TARGET_PORT% müsait.%RESET%
    set "PORT=%TARGET_PORT%"
)
exit /b 0

:: ── Komut: Dev Server ────────────────────────────────────────────────────────
:cmd_dev
cls
call :print_banner
echo %BOLD%%GREEN%[GELİŞTİRME SUNUCUSU (DEV)]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
call :verify_prerequisites
call :check_and_resolve_port %DEFAULT_PORT%
echo.
echo %GREEN%  ➜ Local:     http://localhost:%PORT%%RESET%
echo %GREEN%  ➜ Araç:      http://localhost:%PORT%/tools/yt-playlist-length%RESET%
echo.
echo %BLUE%  Mod:        Next.js Turbopack Hot-Reload%RESET%
echo %YELLOW%  Durdurmak:  Ctrl + C%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
echo.

:: Tarayıcıyı 3 saniye sonra otomatik aç
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:%PORT%"

npm run dev -- -p %PORT%
goto :post_action

:: ── Komut: Build ─────────────────────────────────────────────────────────────
:cmd_build
cls
call :print_banner
echo %BOLD%%BLUE%[PRODUCTION BUILD]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
call :verify_prerequisites
echo.
echo %BLUE%Eski build önbelleği temizleniyor...%RESET%
if exist "%NEXT_DIR%" rmdir /s /q "%NEXT_DIR%"

echo %BLUE%Next.js ve TypeScript derleme süreci başlatılıyor...%RESET%
echo.
npm run build
if %errorlevel% neq 0 (
    echo.
    echo %RED%[✗] Derleme başarısız oldu! Hataları yukarıdan inceleyin.%RESET%
    goto :post_action
)
echo.
echo %GREEN%[✓] Production build başarıyla tamamlandı!%RESET%
goto :post_action

:: ── Komut: Start ─────────────────────────────────────────────────────────────
:cmd_start
cls
call :print_banner
echo %BOLD%%MAGENTA%[PRODUCTION SUNUCUSU]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
call :verify_prerequisites
if not exist "%NEXT_DIR%" (
    echo %YELLOW%[!] Önce production build alınması gerekiyor...%RESET%
    npm run build
    if %errorlevel% neq 0 goto :post_action
)
call :check_and_resolve_port %DEFAULT_PORT%
echo.
echo %GREEN%  ➜ Canlı Adres: http://localhost:%PORT%%RESET%
echo.
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:%PORT%"
npm run start -- -p %PORT%
goto :post_action

:: ── Komut: Lint & Typecheck ──────────────────────────────────────────────────
:cmd_lint
cls
call :print_banner
echo %BOLD%%YELLOW%[KOD KALİTE & LİNT KONTROLÜ]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
call :verify_prerequisites
echo.
echo %BLUE%ESLint kuralları denetleniyor...%RESET%
npm run lint
if %errorlevel% neq 0 (
    echo.
    echo %RED%[✗] Lint hataları tespit edildi!%RESET%
) else (
    echo.
    echo %GREEN%[✓] Harika! Sıfır lint hatası, tüm kod kurallara uygun.%RESET%
)
goto :post_action

:: ── Komut: Doctor / Sağlık Kontrolü ───────────────────────────────────────────
:cmd_doctor
cls
call :print_banner
echo %BOLD%%CYAN%[SİSTEM VE PROJE SAĞLIK KONTROLÜ]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%

:: Node
for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_V=%%v"
if defined NODE_V (
    echo %GREEN%  [✓] Node.js         : %NODE_V%%RESET%
) else (
    echo %RED%  [✗] Node.js         : Bulunamadı%RESET%
)

:: npm
for /f "delims=" %%v in ('npm -v 2^>nul') do set "NPM_V=%%v"
if defined NPM_V (
    echo %GREEN%  [✓] npm             : v%NPM_V%%RESET%
) else (
    echo %RED%  [✗] npm             : Bulunamadı%RESET%
)

:: Git
for /f "delims=" %%v in ('git --version 2^>nul') do set "GIT_V=%%v"
if defined GIT_V (
    echo %GREEN%  [✓] Git             : %GIT_V%%RESET%
) else (
    echo %YELLOW%  [!] Git             : Bulunamadı%RESET%
)

:: Next.js versiyonu
if exist "%NODE_MODULES%\next\package.json" (
    echo %GREEN%  [✓] Next.js         : Kurulu%RESET%
) else (
    echo %YELLOW%  [!] Next.js         : node_modules eksik%RESET%
)

:: TypeScript kontrolü
if exist "%PROJECT_DIR%\tsconfig.json" (
    echo %GREEN%  [✓] TypeScript Config : Mevcut%RESET%
)

:: .gitignore kontrolü
if exist "%PROJECT_DIR%\.gitignore" (
    echo %GREEN%  [✓] .gitignore      : Kapsamlı ve aktif%RESET%
)

:: .env.local kontrolü
if exist "%PROJECT_DIR%\.env.local" (
    echo %GREEN%  [✓] .env.local      : Mevcut%RESET%
) else (
    echo %BLUE%  [i] .env.local      : Yok (Opsiyonel / API key gereksinimi yok)%RESET%
)

echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
goto :post_action

:: ── Komut: Clean ─────────────────────────────────────────────────────────────
:cmd_clean
cls
call :print_banner
echo %BOLD%%WHITE%[ÖNBELLEK VE LOG TEMİZLİĞİ]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
echo.
if exist "%NEXT_DIR%" (
    echo   .next klasörü siliniyor...
    rmdir /s /q "%NEXT_DIR%"
    echo %GREEN%  [✓] .next temizlendi.%RESET%
)
if exist "%PROJECT_DIR%\.turbo" (
    rmdir /s /q "%PROJECT_DIR%\.turbo"
    echo %GREEN%  [✓] .turbo temizlendi.%RESET%
)
if exist "%PROJECT_DIR%\logs" (
    rmdir /s /q "%PROJECT_DIR%\logs"
    echo %GREEN%  [✓] logs temizlendi.%RESET%
)
if exist "%PROJECT_DIR%\.eslintcache" (
    del /f "%PROJECT_DIR%\.eslintcache"
    echo %GREEN%  [✓] .eslintcache temizlendi.%RESET%
)
echo.
echo %GREEN%Tüm geçici dosyalar ve derleme önbellekleri temizlendi.%RESET%
goto :post_action

:: ── Komut: Reset ─────────────────────────────────────────────────────────────
:cmd_reset
cls
call :print_banner
echo %BOLD%%RED%[TAM SIFIRLAMA VE YENİDEN KURULUM]%RESET%
echo %YELLOW%Bu işlem node_modules, .next ve tüm önbellekleri silip baştan kuracaktır!%RESET%
echo.
set /p "CONFIRM=Emin misiniz? (E/H): "
if /i not "%CONFIRM%"=="E" (
    echo %BLUE%İşlem iptal edildi.%RESET%
    goto :post_action
)
echo.
if exist "%NODE_MODULES%" (
    echo   node_modules siliniyor...
    rmdir /s /q "%NODE_MODULES%"
    echo %GREEN%  [✓] node_modules silindi.%RESET%
)
if exist "%NEXT_DIR%" rmdir /s /q "%NEXT_DIR%"
if exist "%PROJECT_DIR%\package-lock.json" del /f "%PROJECT_DIR%\package-lock.json"

echo.
echo %BLUE%npm install başlatılıyor...%RESET%
npm install
if %errorlevel% neq 0 (
    echo %RED%[✗] Kurulum başarısız oldu!%RESET%
) else (
    echo %GREEN%[✓] Sıfırdan temiz kurulum başarıyla tamamlandı!%RESET%
)
goto :post_action

:: ── Komut: Port Yöneticisi ───────────────────────────────────────────────────
:cmd_port_manager
cls
call :print_banner
echo %BOLD%%YELLOW%[PORT VE SÜREÇ YÖNETİCİSİ]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
echo.
echo Dinlenen portlar taranıyor (3000, 3001, 8080)...
echo.
netstat -ano | findstr /R /C:":3000 .*LISTENING" /C:":3001 .*LISTENING" /C:":8080 .*LISTENING"
if %errorlevel% neq 0 (
    echo %GREEN%[✓] 3000, 3001 ve 8080 portları tamamen boş ve kullanılabilir.%RESET%
) else (
    echo.
    echo %YELLOW%Kapatmak istediğiniz PID numarasını yazın (İptal için boş bırakıp Enter'a basın):%RESET%
    set /p "KILL_PID=PID: "
    if not "!KILL_PID!"=="" (
        taskkill /F /PID !KILL_PID!
        echo %GREEN%[✓] PID !KILL_PID! sonlandırıldı.%RESET%
    )
)
goto :post_action

:: ── Komut: Git Durumu ────────────────────────────────────────────────────────
:cmd_git_status
cls
call :print_banner
echo %BOLD%%BLUE%[GIT DURUM VE SENKRONİZASYON]%RESET%
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
git status
echo.
echo %MAGENTA%─────────────────────────────────────────────────────%RESET%
goto :post_action

:: ── Sessiz Yükleme Yardımcısı ────────────────────────────────────────────────
:cmd_install_silent
npm install --no-audit --no-fund
exit /b 0

:: ── Yardım Ekranı ────────────────────────────────────────────────────────────
:show_help
echo %BOLD%%WHITE%Kullanım:%RESET%
echo   server.bat [komut]
echo.
echo %BOLD%%WHITE%Komutlar:%RESET%
echo   %GREEN%dev%RESET%        Geliştirme sunucusunu başlat (Turbopack)
echo   %GREEN%build%RESET%      Production build al
echo   %GREEN%start%RESET%      Production sunucusunu başlat
echo   %GREEN%lint%RESET%       ESLint kod kalitesi kontrolü
echo   %GREEN%doctor%RESET%     Sistem ve bağımlılık sağlık raporu
echo   %GREEN%clean%RESET%      Önbellekleri temizle (.next, .turbo)
echo   %GREEN%reset%RESET%      node_modules ve önbellekleri sıfırla
echo   %GREEN%git%RESET%        Git durumunu görüntüle
echo   %GREEN%help%RESET%       Bu yardım ekranını göster
echo.
exit /b 0

:: ── Aksiyon Sonrası Menü / Bekleme ───────────────────────────────────────────
:post_action
echo.
echo %DIM%─────────────────────────────────────────────────────────────%RESET%
echo %WHITE%[M] Ana Menüye Dön  ^|  [Q] Çıkış%RESET%
set /p "NEXT_ACT=Seçiminiz (M/Q) [Varsayılan: M]: "
if /i "%NEXT_ACT%"=="Q" goto :graceful_exit
goto :main_menu

:: ── Hata ve Çıkış ────────────────────────────────────────────────────────────
:fatal
echo.
echo %RED%═════════════════════════════════════════════════════════════%RESET%
echo %RED%  HATA: Kritik bir sorun nedeniyle işlem durduruldu.%RESET%
echo %RED%═════════════════════════════════════════════════════════════%RESET%
echo.
pause
exit /b 1

:graceful_exit
echo.
echo %CYAN%EverythingHub konsolundan çıkılıyor. İyi çalışmalar! 👋%RESET%
echo.
timeout /t 1 >nul
exit /b 0
