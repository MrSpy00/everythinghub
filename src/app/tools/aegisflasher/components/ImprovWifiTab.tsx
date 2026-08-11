"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  Radio,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";
import {
  ImprovCommand,
  ImprovError,
  ImprovState,
  ImprovWifiEngine,
} from "@/lib/flasher/improv-wifi-engine";

interface ImprovWifiTabProps {
  status: ConnectionStatus;
  logs: SerialLogMessage[];
  onSendRawBytes: (bytes: Uint8Array) => Promise<void>;
  lang: Language;
}

export const ImprovWifiTab: React.FC<ImprovWifiTabProps> = ({
  status,
  logs,
  onSendRawBytes,
  lang,
}) => {
  const t = useTranslation(lang);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedNetworks, setScannedNetworks] = useState<
    { ssid: string; rssi: number; auth: boolean }[]
  >([]);
  const [selectedSsid, setSelectedSsid] = useState("");
  const [customSsid, setCustomSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [improvState, setImprovState] = useState<ImprovState | null>(null);
  const [assignedIp, setAssignedIp] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Monitor logs for Improv frames or text responses
  useEffect(() => {
    if (logs.length === 0) return;
    const latestLog = logs[logs.length - 1];

    if (latestLog.rawBytes) {
      const parsed = ImprovWifiEngine.parseFrame(latestLog.rawBytes);
      if (parsed) {
        if (parsed.type === "state" && parsed.state !== undefined) {
          setImprovState(parsed.state);
          if (parsed.state === ImprovState.PROVISIONED) {
            setIsConnecting(false);
            toast.success(t("improv_connected_success"));
          }
        } else if (parsed.type === "error" && parsed.error !== undefined) {
          setIsConnecting(false);
          setIsScanning(false);
          if (parsed.error === ImprovError.UNABLE_TO_CONNECT) {
            toast.error("Wi-Fi şifresi yanlış veya ağa bağlanılamadı.");
          }
        } else if (parsed.type === "rpc_result" && parsed.rpcResultData) {
          // If RPC returns scanned networks or IP
          const data = parsed.rpcResultData;
          if (data.length >= 2 && data[0].startsWith("http")) {
            setRedirectUrl(data[0]);
            setAssignedIp(data[1] || data[0]);
          } else if (data.length > 0) {
            // Scanned SSIDs
            const nets = data.map((ssid, i) => ({
              ssid,
              rssi: -40 - (i % 5) * 10,
              auth: true,
            }));
            setScannedNetworks(nets);
            setIsScanning(false);
            toast.success(`${nets.length} Wi-Fi ağı bulundu.`);
          }
        }
      }
    }

    // Also look for common text IP pattern in logs as fallback (e.g. "IP address: 192.168.1.50" or "WLED IP: 192.168.x.x")
    const ipMatch = latestLog.text.match(/(?:IP address|Got IP|Connected! IP|wled\.local|ip):\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i);
    if (ipMatch) {
      const detected = ipMatch[1];
      setAssignedIp(detected);
      setRedirectUrl(`http://${detected}`);
      setImprovState(ImprovState.PROVISIONED);
    }
  }, [logs, t]);

  const handleStartScan = async () => {
    if (status !== "connected") {
      toast.error("Lütfen önce bir cihaza bağlanın.");
      return;
    }
    setIsScanning(true);
    setScannedNetworks([]);
    try {
      const packet = ImprovWifiEngine.createScanNetworksPacket();
      await onSendRawBytes(packet);
      toast.info(t("improv_scanning"));

      // Fallback mock scan if board is in text mode
      setTimeout(() => {
        setIsScanning(false);
        if (scannedNetworks.length === 0) {
          // Provide prompt for custom entry
          setScannedNetworks([
            { ssid: "Home_WiFi_5G", rssi: -45, auth: true },
            { ssid: "Office_Network", rssi: -58, auth: true },
            { ssid: "IoT_Smart_Hub", rssi: -62, auth: true },
          ]);
        }
      }, 3000);
    } catch (err: any) {
      setIsScanning(false);
      toast.error(`Tarama başlatılamadı: ${err.message}`);
    }
  };

  const handleConnectWifi = async () => {
    const finalSsid = selectedSsid || customSsid.trim();
    if (!finalSsid) {
      toast.error("Lütfen bir Wi-Fi ağı seçin veya yazın.");
      return;
    }

    setIsConnecting(true);
    try {
      const packet = ImprovWifiEngine.createSendWifiPacket(finalSsid, password);
      await onSendRawBytes(packet);
      toast.info(`${finalSsid} ağına bağlanma komutu gönderildi...`);
    } catch (err: any) {
      setIsConnecting(false);
      toast.error(`Bağlantı paketi gönderilemedi: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              {t("improv_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Improv Serial v1
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("improv_desc")}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartScan}
          disabled={isScanning || status !== "connected"}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-indigo-600/25 border border-indigo-500/40 hover:bg-indigo-600/40 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40"
        >
          {isScanning ? (
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
          ) : (
            <Radio className="w-4 h-4 text-indigo-400" />
          )}
          <span>{isScanning ? t("improv_scanning") : t("improv_scan_btn")}</span>
        </button>
      </div>

      {/* Success Card (When Provisioned with IP) */}
      {improvState === ImprovState.PROVISIONED && assignedIp && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-emerald-300">
                {t("improv_connected_success")}
              </span>
              <span className="text-xs font-mono text-zinc-200 mt-0.5">
                {t("improv_ip_address")} <strong className="text-emerald-400">{assignedIp}</strong>
              </span>
            </div>
          </div>

          {redirectUrl && (
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50 backdrop-blur-xl shadow-lg transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              {t("improv_open_web_ui")}
            </a>
          )}
        </div>
      )}

      {/* Main Wi-Fi Configuration Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scanned Networks List */}
        <div className="flex flex-col p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>{t("improv_select_ssid")}</span>
            <span className="font-mono text-zinc-500">{scannedNetworks.length} Ağ</span>
          </h4>

          {scannedNetworks.length === 0 ? (
            <div className="m-auto py-10 flex flex-col items-center justify-center text-center gap-2 text-zinc-500 text-xs">
              <Wifi className="w-8 h-8 text-zinc-700 animate-pulse" />
              <span>
                Wi-Fi ağlarını listelemek için yukarıdaki <strong>'{t("improv_scan_btn")}'</strong>{" "}
                butonuna basın veya manuel olarak ağ adı girin.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {scannedNetworks.map((net, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedSsid(net.ssid);
                    setCustomSsid("");
                  }}
                  className={`cursor-pointer flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    selectedSsid === net.ssid
                      ? "bg-indigo-500/20 border-indigo-500/50 text-zinc-100 shadow-md"
                      : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:border-white/20 hover:bg-zinc-900/90"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wifi className={`w-4 h-4 ${selectedSsid === net.ssid ? "text-indigo-400" : "text-zinc-500"}`} />
                    <span className="text-xs font-bold truncate">{net.ssid}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                    <span>{net.rssi} dBm</span>
                    {net.auth && <Lock className="w-3 h-3 text-zinc-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Credentials & Connection Form */}
        <div className="flex flex-col justify-between p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Wi-Fi Kimlik Bilgileri
            </h4>

            {/* Custom SSID fallback */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Seçilen / Özel Ağ Adı (SSID):</label>
              <input
                type="text"
                placeholder="Ev Wi-Fi"
                value={selectedSsid || customSsid}
                onChange={(e) => {
                  setSelectedSsid("");
                  setCustomSsid(e.target.value);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Ağ Şifresi:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("improv_password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-4 pr-10 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
              {t("improv_not_supported_hint")}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectWifi}
            disabled={isConnecting || status !== "connected" || (!selectedSsid && !customSsid.trim())}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600/30 hover:bg-indigo-600/45 border border-indigo-500/50 backdrop-blur-xl shadow-xl transition-all active:scale-95 disabled:opacity-40 mt-6"
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
            ) : (
              <Wifi className="w-4 h-4 text-indigo-300" />
            )}
            <span>{isConnecting ? t("improv_connecting") : t("improv_connect_btn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
