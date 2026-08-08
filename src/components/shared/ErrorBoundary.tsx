"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl my-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 backdrop-blur-2xl text-center space-y-4 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-bold text-white">
            {this.props.fallbackTitle || "İçerik Yüklenirken Bir Sorun Oluştu"}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            {this.props.fallbackMessage ||
              "Görüntülenen veriler işlenirken beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin veya başka bir bağlantı sorgulayın."}
          </p>

          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/40 px-5 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Yeniden Dene</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
