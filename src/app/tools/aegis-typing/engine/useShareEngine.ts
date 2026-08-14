'use client';
// ============================================================
// aegisTyping — Share Engine
// Share URL generation, clipboard export, and PNG certificate
// Zero emoji standard, localized Turkish & English formats
// ============================================================
import { useCallback } from 'react';
import type { TestResult } from '../types';
import { getSpeedTier, SPEED_TIER_LABELS } from '../types';

export function useShareEngine() {
  const generateShareUrl = useCallback((result: TestResult) => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://www.everythinghub.com.tr';

    const params = new URLSearchParams({
      wpm: (Math.round(result.wpm * 10) / 10).toString(),
      raw: (Math.round(result.rawWpm * 10) / 10).toString(),
      acc: (Math.round(result.accuracy * 10) / 10).toString(),
      mode: result.mode,
      lang: result.language || 'tr-q',
      cpm: result.cpm.toString(),
      err: result.errors.toString(),
    });

    return `${origin}/tools/aegis-typing/result?${params.toString()}`;
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  }, []);

  const shareToTwitter = useCallback(
    (result: TestResult) => {
      const url = generateShareUrl(result);
      const text = `aegisTyping Studio üzerinde ${Math.round(result.wpm)} Net WPM hız ve %${result.accuracy.toFixed(1)} doğruluk elde ettim! Sen de dene:`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank',
        'noopener'
      );
    },
    [generateShareUrl]
  );

  const shareToWhatsApp = useCallback(
    (result: TestResult) => {
      const url = generateShareUrl(result);
      const text = `aegisTyping Studio üzerinde ${Math.round(result.wpm)} Net WPM hız ve %${result.accuracy.toFixed(1)} doğruluk elde ettim! Sertifika bağlantısı: ${url}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    },
    [generateShareUrl]
  );

  const copyDiscordEmbed = useCallback(
    async (result: TestResult) => {
      const tier = getSpeedTier(result.wpm);
      const tierInfo = SPEED_TIER_LABELS[tier];
      const url = generateShareUrl(result);
      const embedText = `**[aegisTyping Studio] Sonuç Raporu**\n- **Net Hız:** ${Math.round(result.wpm)} WPM\n- **Doğruluk:** %${result.accuracy.toFixed(1)}\n- **Seviye:** ${tierInfo.label}\n- **Mod:** ${result.mode} (${result.modeValue}) • ${result.language.toUpperCase()}\n- **Sertifika Doğrulama:** ${url}`;
      await copyToClipboard(embedText);
    },
    [generateShareUrl, copyToClipboard]
  );

  const downloadResultPng = useCallback(async (result: TestResult) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = getSpeedTier(result.wpm);
    const tierInfo = SPEED_TIER_LABELS[tier];

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle gradient glow
    const grad = ctx.createRadialGradient(600, 315, 60, 600, 315, 600);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.15)');
    grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    // Title / Brand
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillText('aegisTyping Studio', canvas.width / 2, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText('Doğrulanmış Yazma Hızı Testi Sertifikası', canvas.width / 2, 150);

    // Net WPM
    ctx.fillStyle = tierInfo.color || '#22d3ee';
    ctx.font = 'bold 140px monospace';
    ctx.fillText(`${Math.round(result.wpm)}`, canvas.width / 2 - 160, 340);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('Net WPM', canvas.width / 2 - 160, 395);

    // Accuracy
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 140px monospace';
    ctx.fillText(`%${Math.round(result.accuracy)}`, canvas.width / 2 + 160, 340);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('Doğruluk', canvas.width / 2 + 160, 395);

    // Meta details & Tier
    ctx.fillStyle = tierInfo.color || '#22d3ee';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(`Seviye: ${tierInfo.label} • ${result.mode.toUpperCase()} (${result.modeValue}) • ${result.language.toUpperCase()}`, canvas.width / 2, 480);

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText('https://www.everythinghub.com.tr/tools/aegis-typing', canvas.width / 2, 560);

    // Download PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `aegis-typing-result-${Date.now()}.png`;
    link.click();
  }, []);

  const shareNative = useCallback(
    async (result: TestResult): Promise<boolean> => {
      if (typeof navigator === 'undefined' || !navigator.share) return false;

      try {
        await navigator.share({
          title: 'aegisTyping Studio Sonucu',
          text: `aegisTyping Studio üzerinde ${Math.round(result.wpm)} Net WPM hız ve %${result.accuracy.toFixed(1)} doğruluk skoru elde ettim!`,
          url: generateShareUrl(result),
        });
        return true;
      } catch {
        return false;
      }
    },
    [generateShareUrl]
  );

  return {
    generateShareUrl,
    copyToClipboard,
    shareToTwitter,
    shareToWhatsApp,
    copyDiscordEmbed,
    downloadResultPng,
    shareNative,
  };
}
