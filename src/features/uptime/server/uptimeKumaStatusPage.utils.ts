import type {
  UptimeMonitorHistoryPoint,
  UptimeIncidentSnapshot,
  UptimeMonitorSnapshot,
  UptimeState,
} from "@/features/uptime/server/uptimeTypes";
import type {
  UptimeKumaHeartbeatPayload,
  UptimeKumaPreloadData,
} from "@/features/uptime/server/uptimeKumaStatusPage.schemas";

export const defaultPollIntervalMs = 300_000;

export function toIsoDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T") + "Z";
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapIncidentStatus(title: string) {
  const value = title.toLowerCase();

  if (value.includes("fixed") || value.includes("resolved")) {
    return "resolved" as const;
  }

  if (value.includes("notice") || value.includes("maintenance")) {
    return "notice" as const;
  }

  return "investigating" as const;
}

export function statusFromHeartbeatCode(
  code: number,
): Exclude<UptimeState, "stale"> {
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

export function summarizeStatus(status: UptimeState, monitorCount: number) {
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

export function overallStatus(monitors: UptimeMonitorSnapshot[]): UptimeState {
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

export function buildIncidents(
  incident: UptimeKumaPreloadData["incident"],
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

export function buildMonitors(
  preloadData: UptimeKumaPreloadData,
  heartbeatPayload: UptimeKumaHeartbeatPayload,
  pollIntervalMs: number,
) {
  const staleThresholdMs = Math.max(pollIntervalMs * 2, 10 * 60 * 1000);
  const now = Date.now();

  return preloadData.publicGroupList.flatMap((group) =>
    group.monitorList.map((monitor) => {
      const heartbeatEntries =
        heartbeatPayload.heartbeatList[String(monitor.id)] ?? [];
      const latestHeartbeat = heartbeatEntries.at(-1);
      const history: UptimeMonitorHistoryPoint[] = heartbeatEntries
        .slice(-60)
        .map((heartbeat) => ({
          status: statusFromHeartbeatCode(heartbeat.status),
          checkedAt: toIsoDate(heartbeat.time),
        }));
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
        history,
      } satisfies UptimeMonitorSnapshot;
    }),
  );
}
