export type UptimeState =
  | "operational"
  | "degraded"
  | "outage"
  | "unknown"
  | "stale";

export type UptimeSource = "mock" | "kuma-api" | "kuma-page-parser";

export interface UptimeMonitorHistoryPoint {
  status: Exclude<UptimeState, "stale">;
  checkedAt: string | null;
}

export interface UptimeMonitorSnapshot {
  id: string;
  name: string;
  status: UptimeState;
  checkedAt: string | null;
  responseTimeMs: number | null;
  uptimeRatio24h: number | null;
  history: UptimeMonitorHistoryPoint[];
}

export interface UptimeIncidentSnapshot {
  id: string;
  title: string;
  status: "investigating" | "resolved" | "notice";
  startedAt: string | null;
  resolvedAt: string | null;
  summary: string | null;
}

export interface UptimeSnapshot {
  status: UptimeState;
  checkedAt: string;
  source: UptimeSource;
  pollIntervalMs: number;
  summary: string;
  statusPageUrl: string | null;
  monitors: UptimeMonitorSnapshot[];
  incidents: UptimeIncidentSnapshot[];
}

export interface UptimeProvider {
  getStatus(identifier: string): Promise<UptimeSnapshot>;
}
