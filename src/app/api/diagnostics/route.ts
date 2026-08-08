import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET() {
  const status = logger.getSystemStatus();
  const recentLogs = logger.getRecentLogs().slice(-20).map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    level: log.level,
    context: log.context,
    message: log.message,
  }));

  return NextResponse.json({
    project: "everythinghub",
    version: "1.0.0",
    status: status.status,
    environment: status.environment,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    diagnostics: {
      totalLogs: status.logCount,
      errorsCount: status.errorsCount,
      memoryUsage: process.memoryUsage ? process.memoryUsage() : null,
      nodeVersion: process.version,
    },
    recentLogs,
  });
}
