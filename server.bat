@echo off
setlocal
title EverythingHub - Gelistirme Konsolu
cd /d "%~dp0"

REM ============================================================================
REM  EVERYTHINGHUB - Windows Yonetim ve Gelistirme Konsolu
REM ============================================================================

set "PORT=3000"

REM Parametre kontrolu
if /i "%~1"=="dev"       goto run_dev
if /i "%~1"=="build"     goto run_build
if /i "%~1"=="start"     goto run_start
if /i "%~1"=="lint"      goto run_lint
if /i "%~1"=="doctor"    goto run_doctor
if /i "%~1"=="check"     goto run_doctor
if /i "%~1"=="clean"     goto run_clean
if /i "%~1"=="reset"     goto run_reset
if /i "%~1"=="install"   goto run_install
if /i "%~1"=="git"       goto run_git
if /i "%~1"=="help"      goto run_help
if /i "%~1"=="--help"    goto run_help
if /i "%~1"=="-h"        goto run_help

:menu
cls
echo ===============================================================================
echo   EVERYTHINGHUB - AKILLI GELISIM VE YONETIM MERKEZI
echo ===============================================================================
echo.

if exist "node_modules\next" (
    echo   [DURUM] Sistem Hazir  ^|  Port: %PORT%  ^|  Dizin: %~dp0
) else (
    echo   [UYARI] node_modules eksik! Ilk once [7] ile kurulum yapiniz.
)

echo.
echo -------------------------------------------------------------------------------
echo   Lutfen yapmak istediginiz islemi seciniz:
echo -------------------------------------------------------------------------------
echo.
echo   [1] Gelistirme Sunucusunu Baslat (npm run dev -- Turbopack)
echo   [2] Production Derleme Al        (npm run build)
echo   [3] Production Sunucusunu Baslat (npm run start)
echo   [4] Kod Kalitesi ve ESLint       (npm run lint)
echo   [5] Sistem Saglik Raporu         (Node.js, npm, Git, Next.js)
echo   [6] Onbellegi Temizle            (.next, .turbo, cache)
echo   [7] Bagimliliklari Sifirdan Kur  (Temiz npm install)
echo   [8] Port 3000 Kontrol ve Temizle (Kullanan programi kapat)
echo   [9] Git Durumu ve Senkronizasyon (git status)
echo   [0] Cikis
echo.
echo ===============================================================================

choice /c 1234567890 /n /m "Seciminiz [1-9, 0]: "
set "SEL=%ERRORLEVEL%"

if "%SEL%"=="1" goto run_dev
if "%SEL%"=="2" goto run_build
if "%SEL%"=="3" goto run_start
if "%SEL%"=="4" goto run_lint
if "%SEL%"=="5" goto run_doctor
if "%SEL%"=="6" goto run_clean
if "%SEL%"=="7" goto run_reset
if "%SEL%"=="8" goto run_port
if "%SEL%"=="9" goto run_git
if "%SEL%"=="10" goto run_exit

goto menu

REM ============================================================================
REM  [1] Gelistirme Sunucusu
REM ============================================================================
:run_dev
cls
echo ===============================================================================
echo   GELISTIRME SUNUCUSU (DEV) - TURBOPACK
echo ===============================================================================
echo.
call :check_prereqs
call :check_port

echo.
echo   - Local Adres  : http://localhost:%PORT%
echo   - YT Playlist  : http://localhost:%PORT%/tools/yt-playlist-length
echo.
echo   Sunucu baslatiliyor... 3 saniye sonra tarayici otomatik acilacak.
echo   Durdurmak icin bu pencerede Ctrl + C tuslarina basiniz.
echo ===============================================================================
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:%PORT%"
call npm run dev -- -p %PORT%
goto pause_and_menu

REM ============================================================================
REM  [2] Production Build
REM ============================================================================
:run_build
cls
echo ===============================================================================
echo   PRODUCTION DERLEME (BUILD)
echo ===============================================================================
echo.
call :check_prereqs
echo Eski derleme dosyalari temizleniyor...
if exist ".next" rmdir /s /q ".next"
echo.
echo Next.js ve TypeScript derlemesi baslatiliyor...
echo.
call npm run build
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Production build sifir hata ile tamamlandi!
) else (
    echo.
    echo [HATA] Derleme sirasinda hata olustu.
)
goto pause_and_menu

REM ============================================================================
REM  [3] Production Start
REM ============================================================================
:run_start
cls
echo ===============================================================================
echo   PRODUCTION SUNUCUSU (START)
echo ===============================================================================
echo.
call :check_prereqs
if not exist ".next" (
    echo [BILGI] Production derleme bulunamadi. Once derleme yapiliyor...
    echo.
    call npm run build
    if %errorlevel% neq 0 goto pause_and_menu
)
call :check_port
echo.
echo   - Canli Adres: http://localhost:%PORT%
echo.
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:%PORT%"
call npm run start -- -p %PORT%
goto pause_and_menu

REM ============================================================================
REM  [4] ESLint
REM ============================================================================
:run_lint
cls
echo ===============================================================================
echo   KOD KALITESI VE ESLINT KONTROLU
echo ===============================================================================
echo.
call :check_prereqs
echo ESLint kurallari denetleniyor...
echo.
call npm run lint
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Kod tabaninda sifir lint hatasi tespit edildi.
) else (
    echo.
    echo [UYARI] Lint hatalari bulundu.
)
goto pause_and_menu

REM ============================================================================
REM  [5] Doctor / Sistem Saglik Raporu
REM ============================================================================
:run_doctor
cls
echo ===============================================================================
echo   SISTEM VE PROJE SAGLIK RAPORU
echo ===============================================================================
echo.
echo [1] Node.js Surumu:
node -v 2>nul || echo [HATA] Node.js bulunamadi!
echo.
echo [2] npm Surumu:
npm -v 2>nul || echo [HATA] npm bulunamadi!
echo.
echo [3] Git Surumu:
git --version 2>nul || echo [UYARI] Git bulunamadi!
echo.
echo [4] Kritik Proje Dosyalari:
if exist "package.json" (echo   [OK] package.json) else (echo   [EKSIK] package.json)
if exist "tsconfig.json" (echo   [OK] tsconfig.json) else (echo   [EKSIK] tsconfig.json)
if exist "next.config.mjs" (echo   [OK] next.config.mjs) else (echo   [EKSIK] next.config.mjs)
if exist ".gitignore" (echo   [OK] .gitignore) else (echo   [EKSIK] .gitignore)
if exist "node_modules\next" (echo   [OK] Next.js paketi kurulu) else (echo   [UYARI] node_modules eksik!)
echo.
echo ===============================================================================
goto pause_and_menu

REM ============================================================================
REM  [6] Onbellek Temizligi
REM ============================================================================
:run_clean
cls
echo ===============================================================================
echo   ONBELLEK VE GECICI DOSYA TEMIZLIGI
echo ===============================================================================
echo.
if exist ".next" (
    echo .next klasoru siliniyor...
    rmdir /s /q ".next"
    echo [OK] .next temizlendi.
) else (
    echo .next klasoru zaten temiz.
)

if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo [OK] .turbo temizlendi.
)

if exist ".eslintcache" (
    del /f ".eslintcache"
    echo [OK] .eslintcache temizlendi.
)
echo.
echo [TAMAM] Onbellekler basariyla temizlendi.
goto pause_and_menu

REM ============================================================================
REM  [7] Reset / Temiz Kurulum
REM ============================================================================
:run_reset
cls
echo ===============================================================================
echo   SIFIRDAN TEMIZ KURULUM (RESET)
echo ===============================================================================
echo.
echo DIKKAT: node_modules ve .next klasorleri silinip yeniden kurulacak.
echo.
choice /c eh /n /m "Devam etmek istiyor musunuz? (E: Evet / H: Hayir): "
if "%ERRORLEVEL%"=="2" goto menu

echo.
if exist "node_modules" (
    echo node_modules siliniyor, lutfen bekleyiniz...
    rmdir /s /q "node_modules"
)
if exist ".next" rmdir /s /q ".next"

echo.
echo npm install calistiriliyor...
echo.
call npm install
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Tum bagimliliklar basariyla kuruldu!
) else (
    echo.
    echo [HATA] Kurulum sirasinda hata olustu.
)
goto pause_and_menu

REM ============================================================================
REM  [8] Port Yoneticisi
REM ============================================================================
:run_port
cls
echo ===============================================================================
echo   PORT VE SUREC YONETICISI
echo ===============================================================================
echo.
echo 3000, 3001 ve 8080 portlari taranıyor...
echo.
netstat -ano | findstr /r /c:":3000 .*LISTENING" /c:":3001 .*LISTENING" /c:":8080 .*LISTENING"
if %errorlevel% neq 0 (
    echo [BILGI] Bu portlar su anda tamamen bos ve kullanilabilir durumda.
) else (
    echo.
    echo Sonlandirmak istediginiz PID numarasini yazip Enter'a basin.
    echo (Islem yapmak istemiyorsaniz sadece Enter'a basin):
    set "USER_PID="
    set /p "USER_PID=PID: "
    if defined USER_PID (
        taskkill /f /pid %USER_PID%
        echo PID %USER_PID% sonlandirildi.
    )
)
goto pause_and_menu

REM ============================================================================
REM  [9] Git Durumu
REM ============================================================================
:run_git
cls
echo ===============================================================================
echo   GIT DURUMU (git status)
echo ===============================================================================
echo.
git status
echo.
echo ===============================================================================
goto pause_and_menu

REM ============================================================================
REM  Yardim
REM ============================================================================
:run_help
echo.
echo EverythingHub Komut Satiri Secenekleri:
echo.
echo   server.bat dev        - Turbopack gelistirme sunucusunu baslatir
echo   server.bat build      - Production build alir
echo   server.bat start      - Production sunucusunu baslatir
echo   server.bat lint       - ESLint kontrolu yapar
echo   server.bat doctor     - Sistem saglik durumunu raporlar
echo   server.bat clean      - Onbellegi temizler
echo   server.bat reset      - node_modules sifirlayip yeniden kurar
echo   server.bat git        - Git durumunu gosterir
echo.
goto pause_and_menu

REM ============================================================================
REM  Yardimci Fonksiyonlar
REM ============================================================================
:check_prereqs
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi! Lutfen https://nodejs.org adresinden kurunuz.
    pause
    goto menu
)

if not exist "node_modules\next" (
    echo [BILGI] node_modules eksik. Otomatik kuruluyor...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [HATA] npm install basarisiz oldu!
        pause
        goto menu
    )
)
exit /b 0

:check_port
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [UYARI] Port %PORT% su anda baska bir uygulama tarafindan kullaniliyor.
    echo.
    echo   [S] Bu uygulamayi sonlandir ve Port %PORT% ile devam et
    echo   [D] Otomatik olarak Port 3001'e gec
    echo   [I] Iptal et ve ana menuye don
    echo.
    choice /c sdi /n /m "Seciminiz (S/D/I): "
    if "%ERRORLEVEL%"=="3" goto menu
    if "%ERRORLEVEL%"=="2" (
        set "PORT=3001"
        echo Port 3001 olarak ayarlandi.
    )
    if "%ERRORLEVEL%"=="1" (
        for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
            echo PID %%p sonlandiriliyor...
            taskkill /f /pid %%p >nul 2>&1
        )
        timeout /t 1 >nul
        echo Port %PORT% serbest birakildi.
    )
)
exit /b 0

:pause_and_menu
echo.
echo Ana menuye donmek icin herhangi bir tusa basiniz...
pause >nul
goto menu

:run_exit
echo.
echo EverythingHub kapaniyor. Iyi calismalar!
timeout /t 1 >nul
exit /b 0
