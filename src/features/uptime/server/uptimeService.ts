import { uptimeKumaStatusPageProvider } from "@/features/uptime/server/uptimeKumaStatusPageProvider";
import type {
  UptimeMonitorSnapshot,
  UptimeSnapshot,
} from "@/features/uptime/server/uptimeTypes";

function summarizeServiceStatus(
  monitor: UptimeMonitorSnapshot | null,
  name: string,
) {
  if (!monitor) {
    return `${name} is not currently active on the linked Uptime Kuma status page.`;
  }

  switch (monitor.status) {
    case "operational":
      return `${name} is operating normally.`;
    case "degraded":
      return `${name} is currently degraded or recovering.`;
    case "outage":
      return `${name} is currently reporting an outage.`;
    case "stale":
      return `${name} has stale heartbeat data.`;
    default:
      return `${name} is currently unavailable.`;
  }
}

export function buildServiceUptimeSnapshot(
  applicationSnapshot: UptimeSnapshot,
  monitorId?: string | null,
  serviceName = "This service",
) {
  const monitor =
    applicationSnapshot.monitors.find(
      (candidate) => candidate.id === monitorId,
    ) ?? null;

  return {
    status: monitor?.status ?? "unknown",
    checkedAt: applicationSnapshot.checkedAt,
    source: applicationSnapshot.source,
    pollIntervalMs: monitor ? applicationSnapshot.pollIntervalMs : 0,
    summary: summarizeServiceStatus(monitor, serviceName),
    statusPageUrl: applicationSnapshot.statusPageUrl,
    monitors: monitor ? [monitor] : [],
    incidents: applicationSnapshot.incidents,
  } satisfies UptimeSnapshot;
}

export async function getApplicationUptime(
  uptimeKumaIdentifier?: string | null,
) {
  if (!uptimeKumaIdentifier) {
    return uptimeKumaStatusPageProvider.getStatus("");
  }

  return uptimeKumaStatusPageProvider.getStatus(uptimeKumaIdentifier);
}

export async function getApplicationUptimeByIdentifier(identifier: string) {
  return uptimeKumaStatusPageProvider.getStatus(identifier);
}

export async function getApplicationUptimeByIdentifierOrThrow(
  identifier: string,
) {
  return uptimeKumaStatusPageProvider.getStatusOrThrow(identifier);
}

export async function getServiceUptime(
  applicationIdentifier?: string | null,
  monitorId?: string | null,
  serviceName?: string,
) {
  const snapshot = await getApplicationUptime(applicationIdentifier);

  return buildServiceUptimeSnapshot(snapshot, monitorId, serviceName);
}
