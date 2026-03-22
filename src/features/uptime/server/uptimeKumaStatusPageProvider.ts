import JSON5 from "json5";
import { z } from "zod";
import { env } from "@/lib/env";
import type {
  UptimeIncidentSnapshot,
  UptimeMonitorSnapshot,
  UptimeProvider,
  UptimeSnapshot,
  UptimeState,
} from "@/features/uptime/server/uptimeTypes";

const preloadDataSchema = z.object({
  config: z.object({
    title: z.string().nullable().optional(),
    autoRefreshInterval: z.number().int().positive().optional(),
  }),
  incident: z
    .object({
      id: z.number(),
      title: z.string(),
      content: z.string().nullable().optional(),
      createdDate: z.string().nullable().optional(),
      lastUpdatedDate: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  publicGroupList: z
    .array(
      z.object({
        name: z.string(),
        monitorList: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            type: z.string().optional(),
          }),
        ),
      }),
    )
    .default([]),
});

const heartbeatPayloadSchema = z.object({
  heartbeatList: z.record(
    z.string(),
    z.array(
      z.object({
        status: z.number(),
        time: z.string(),
        msg: z.string().optional().default(""),
        ping: z.number().nullable().optional(),
      }),
    ),
  ),
  uptimeList: z.record(z.string(), z.number()).default({}),
});

const preloadDataPattern = /window\.preloadData = (\{[\s\S]*?\});/;
const defaultPollIntervalMs = 300_000;

function toIsoDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T") + "Z";
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapIncidentStatus(title: string) {
  const value = title.toLowerCase();

  if (value.includes("fixed") || value.includes("resolved")) {
    return "resolved" as const;
  }

  if (value.includes("notice") || value.includes("maintenance")) {
    return "notice" as const;
  }

  return "investigating" as const;
}

function statusFromHeartbeatCode(code: number): Exclude<UptimeState, "stale"> {
  switch (code) {
    case 1:
      return "operational";
    case 0:
      return "outage";
    case 2:
    case 3:
      return "degraded";
    default:
      return "unknown";
  }
}

function summarizeStatus(status: UptimeState, monitorCount: number) {
  switch (status) {
    case "operational":
      return monitorCount === 1
        ? "The service is operating normally."
        : "All monitored services are operating normally.";
    case "degraded":
      return "At least one monitored service is degraded or recovering.";
    case "outage":
      return "All monitored services currently report an outage state.";
    case "stale":
      return "Status data is stale. The last heartbeat is older than expected.";
    default:
      return "Live service health is currently unavailable.";
  }
}

function fallbackSnapshot(
  summary: string,
  statusPageUrl: string | null,
): UptimeSnapshot {
  return {
    status: "unknown",
    checkedAt: new Date().toISOString(),
    source: "kuma-page-parser",
    pollIntervalMs: 0,
    summary,
    statusPageUrl,
    monitors: [],
    incidents: [],
  };
}

function overallStatus(monitors: UptimeMonitorSnapshot[]): UptimeState {
  if (!monitors.length) {
    return "unknown";
  }

  if (monitors.every((monitor) => monitor.status === "stale")) {
    return "stale";
  }

  const activeMonitors = monitors.filter(
    (monitor) => monitor.status !== "stale",
  );

  if (!activeMonitors.length) {
    return "stale";
  }

  if (activeMonitors.every((monitor) => monitor.status === "operational")) {
    return monitors.some((monitor) => monitor.status === "stale")
      ? "stale"
      : "operational";
  }

  if (
    activeMonitors.every(
      (monitor) => monitor.status === "outage" || monitor.status === "unknown",
    )
  ) {
    return "outage";
  }

  if (
    activeMonitors.some(
      (monitor) => monitor.status === "outage" || monitor.status === "degraded",
    )
  ) {
    return "degraded";
  }

  return activeMonitors.some((monitor) => monitor.status === "unknown")
    ? "unknown"
    : "operational";
}

function buildIncidents(
  incident: z.infer<typeof preloadDataSchema>["incident"],
): UptimeIncidentSnapshot[] {
  if (!incident) {
    return [];
  }

  return [
    {
      id: String(incident.id),
      title: incident.title,
      status: mapIncidentStatus(incident.title),
      startedAt: toIsoDate(incident.createdDate),
      resolvedAt: toIsoDate(incident.lastUpdatedDate),
      summary: incident.content ?? null,
    },
  ];
}

function buildMonitors(
  preloadData: z.infer<typeof preloadDataSchema>,
  heartbeatPayload: z.infer<typeof heartbeatPayloadSchema>,
  pollIntervalMs: number,
) {
  const staleThresholdMs = Math.max(pollIntervalMs * 2, 10 * 60 * 1000);
  const now = Date.now();

  return preloadData.publicGroupList.flatMap((group) =>
    group.monitorList.map((monitor) => {
      const heartbeatEntries =
        heartbeatPayload.heartbeatList[String(monitor.id)] ?? [];
      const latestHeartbeat = heartbeatEntries.at(-1);
      const checkedAt = toIsoDate(latestHeartbeat?.time);
      const isStale =
        checkedAt !== null &&
        now - new Date(checkedAt).getTime() > staleThresholdMs;

      return {
        id: String(monitor.id),
        name: monitor.name,
        status: latestHeartbeat
          ? isStale
            ? "stale"
            : statusFromHeartbeatCode(latestHeartbeat.status)
          : "unknown",
        checkedAt,
        responseTimeMs: latestHeartbeat?.ping ?? null,
        uptimeRatio24h: heartbeatPayload.uptimeList[`${monitor.id}_24`] ?? null,
      } satisfies UptimeMonitorSnapshot;
    }),
  );
}

function statusPageUrl(identifier: string) {
  if (!env.UPTIME_KUMA_BASE_URL) {
    return null;
  }

  return new URL(`/status/${identifier}`, env.UPTIME_KUMA_BASE_URL).toString();
}

function heartbeatUrl(identifier: string) {
  return new URL(
    `/api/status-page/heartbeat/${identifier}`,
    env.UPTIME_KUMA_BASE_URL,
  ).toString();
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Uptime fetch failed with status ${response.status}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Uptime fetch failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function parsePreloadData(html: string) {
  const match = html.match(preloadDataPattern);

  if (!match?.[1]) {
    throw new Error("Unable to locate Uptime Kuma preload data");
  }

  return preloadDataSchema.parse(JSON5.parse(match[1]));
}

class UptimeKumaStatusPageProvider implements UptimeProvider {
  async getStatus(identifier: string): Promise<UptimeSnapshot> {
    const url = statusPageUrl(identifier);

    if (!identifier.trim()) {
      return fallbackSnapshot(
        "No Uptime Kuma identifier is configured for this application.",
        url,
      );
    }

    if (!env.UPTIME_KUMA_BASE_URL) {
      return fallbackSnapshot(
        "UPTIME_KUMA_BASE_URL is not configured, so live health polling is disabled.",
        null,
      );
    }

    try {
      const [pageHtml, rawHeartbeatPayload] = await Promise.all([
        fetchText(url as string),
        fetchJson(heartbeatUrl(identifier)),
      ]);

      const preloadData = parsePreloadData(pageHtml);
      const heartbeatPayload =
        heartbeatPayloadSchema.parse(rawHeartbeatPayload);
      const pollIntervalMs =
        (preloadData.config.autoRefreshInterval ??
          defaultPollIntervalMs / 1000) * 1000;
      const monitors = buildMonitors(
        preloadData,
        heartbeatPayload,
        pollIntervalMs,
      );
      const status = overallStatus(monitors);
      const incidents = buildIncidents(preloadData.incident);

      return {
        status,
        checkedAt: new Date().toISOString(),
        source: "kuma-page-parser",
        pollIntervalMs,
        summary: summarizeStatus(status, monitors.length),
        statusPageUrl: url,
        monitors,
        incidents,
      };
    } catch {
      return {
        status: "unknown",
        checkedAt: new Date().toISOString(),
        source: "kuma-page-parser",
        pollIntervalMs: defaultPollIntervalMs,
        summary:
          "The status page is currently unavailable. The application remains usable, but live service health could not be refreshed.",
        statusPageUrl: url,
        monitors: [],
        incidents: [],
      };
    }
  }
}

export const uptimeKumaStatusPageProvider = new UptimeKumaStatusPageProvider();
