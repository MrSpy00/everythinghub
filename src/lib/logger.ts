/**
 * EverythingHub Comprehensive Diagnostic & Logging Engine
 * Provides structured logging, performance metrics, client/server error capture,
 * and system telemetry without external telemetry leaks.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "metric";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown> | unknown[];
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  durationMs?: number;
}

interface LoggerState {
  entries: LogEntry[];
  maxEntries: number;
}

const state: LoggerState = {
  entries: [],
  maxEntries: 100,
};

function formatTimestamp(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function pushEntry(entry: LogEntry) {
  state.entries.push(entry);
  if (state.entries.length > state.maxEntries) {
    state.entries.shift();
  }
}

export const logger = {
  debug(context: string, message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG][${context}] ${message}`, data || "");
    }
    pushEntry({
      id: generateId(),
      timestamp: formatTimestamp(),
      level: "debug",
      context,
      message,
      data,
    });
  },

  info(context: string, message: string, data?: Record<string, unknown>) {
    console.info(`[INFO][${context}] ${message}`, data || "");
    pushEntry({
      id: generateId(),
      timestamp: formatTimestamp(),
      level: "info",
      context,
      message,
      data,
    });
  },

  warn(context: string, message: string, data?: Record<string, unknown>) {
    console.warn(`[WARN][${context}] ${message}`, data || "");
    pushEntry({
      id: generateId(),
      timestamp: formatTimestamp(),
      level: "warn",
      context,
      message,
      data,
    });
  },

  error(
    context: string,
    message: string,
    err?: unknown,
    data?: Record<string, unknown>
  ) {
    const errorDetails =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : typeof err === "object" && err !== null
        ? (err as Record<string, unknown>)
        : undefined;

    console.error(`[ERROR][${context}] ${message}`, err || "", data || "");
    pushEntry({
      id: generateId(),
      timestamp: formatTimestamp(),
      level: "error",
      context,
      message,
      error: errorDetails as LogEntry["error"],
      data,
    });
  },

  metric(context: string, metricName: string, durationMs: number, data?: Record<string, unknown>) {
    pushEntry({
      id: generateId(),
      timestamp: formatTimestamp(),
      level: "metric",
      context,
      message: `Metric: ${metricName} took ${durationMs.toFixed(2)}ms`,
      durationMs,
      data,
    });
  },

  async time<T>(
    context: string,
    operationName: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = performance.now() - start;
      this.metric(context, operationName, durationMs);
      return result;
    } catch (err) {
      const durationMs = performance.now() - start;
      this.error(context, `Failed ${operationName} after ${durationMs.toFixed(2)}ms`, err);
      throw err;
    }
  },

  getRecentLogs(): LogEntry[] {
    return [...state.entries];
  },

  clearLogs() {
    state.entries = [];
  },

  getSystemStatus() {
    return {
      status: "operational",
      environment: process.env.NODE_ENV || "development",
      timestamp: formatTimestamp(),
      logCount: state.entries.length,
      errorsCount: state.entries.filter((e) => e.level === "error").length,
    };
  },
};
