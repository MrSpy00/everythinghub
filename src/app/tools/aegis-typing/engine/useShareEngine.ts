'use client';

import { useCallback } from 'react';
import { TestResult } from '../types';

export function useShareEngine() {
  
  const generateShareUrl = useCallback((result: TestResult) => {
    const params = new URLSearchParams({
      wpm: result.wpm.toString(),
      acc: result.accuracy.toString(),
      mode: result.mode,
      lang: result.language || 'en'
    });
    return `${window.location.origin}/tools/aegis-typing/result?${params.toString()}`;
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  }, []);

  const shareToTwitter = useCallback((result: TestResult) => {
    const text = `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on AegisTyping! Can you beat me?`;
    const url = generateShareUrl(result);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }, [generateShareUrl]);

  const shareToWhatsApp = useCallback((result: TestResult) => {
    const text = `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on AegisTyping! ${generateShareUrl(result)}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }, [generateShareUrl]);

  const copyDiscordEmbed = useCallback(async (result: TestResult) => {
    const embedText = `**AegisTyping Result**\n🏎️ WPM: **${result.wpm}**\n🎯 Accuracy: **${result.accuracy}%**\n⏱️ Mode: ${result.mode}\n\nTry it: ${generateShareUrl(result)}`;
    await copyToClipboard(embedText);
  }, [generateShareUrl, copyToClipboard]);

  const downloadResultPng = useCallback(async (result: TestResult) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Grid/Texture (Simulated)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Accent Line
    ctx.fillStyle = '#8b5cf6'; // violet-500
    ctx.fillRect(0, 0, canvas.width, 10);

    // Text configuration
    ctx.textAlign = 'center';
    
    // Logo / Brand
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText('AegisTyping', canvas.width / 2, 100);
    
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('Advanced Typing Studio', canvas.width / 2, 140);

    // Core Stats
    ctx.fillStyle = '#8b5cf6'; // violet-500 for WPM number
    ctx.font = 'bold 160px Inter, sans-serif';
    ctx.fillText(result.wpm.toString(), canvas.width / 2 - 150, 350);
    
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText('WPM', canvas.width / 2 - 150, 420);

    ctx.fillStyle = '#10b981'; // emerald-500 for Accuracy
    ctx.font = 'bold 160px Inter, sans-serif';
    ctx.fillText(`${result.accuracy}`, canvas.width / 2 + 180, 350);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText('ACC %', canvas.width / 2 + 180, 420);

    // Meta details
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText(`Mode: ${result.mode} • Language: ${result.language || 'English'}`, canvas.width / 2, 550);

    // Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `aegis-typing-result-${Date.now()}.png`;
    link.click();
  }, []);

  const shareNative = useCallback(async (result: TestResult): Promise<boolean> => {
    if (!navigator.share) return false;
    
    try {
      await navigator.share({
        title: 'AegisTyping Result',
        text: `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on AegisTyping!`,
        url: generateShareUrl(result)
      });
      return true;
    } catch (err) {
      console.error('Error sharing natively', err);
      return false;
    }
  }, [generateShareUrl]);

  return {
    generateShareUrl,
    copyToClipboard,
    shareToTwitter,
    shareToWhatsApp,
    copyDiscordEmbed,
    downloadResultPng,
    shareNative
  };
}
