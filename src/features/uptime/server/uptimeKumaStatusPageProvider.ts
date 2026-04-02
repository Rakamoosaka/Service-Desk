import { env } from "@/lib/env";
import type {
  UptimeProvider,
  UptimeSnapshot,
} from "@/features/uptime/server/uptimeTypes";
import { heartbeatPayloadSchema } from "@/features/uptime/server/uptimeKumaStatusPage.schemas";
import {
  fetchJson,
  fetchText,
  heartbeatUrl,
  parsePreloadData,
  statusPageUrl,
} from "@/features/uptime/server/uptimeKumaStatusPage.transport";
import {
  buildIncidents,
  buildMonitors,
  defaultPollIntervalMs,
  overallStatus,
  summarizeStatus,
} from "@/features/uptime/server/uptimeKumaStatusPage.utils";

class UptimeKumaStatusPageProvider implements UptimeProvider {
  async getStatusOrThrow(identifier: string): Promise<UptimeSnapshot> {
    const url = statusPageUrl(identifier);

    if (!identifier.trim()) {
      throw new Error("An Uptime Kuma identifier is required");
    }

    if (!env.UPTIME_KUMA_BASE_URL) {
      throw new Error("UPTIME_KUMA_BASE_URL is not configured");
    }

    const [pageHtml, rawHeartbeatPayload] = await Promise.all([
      fetchText(url as string),
      fetchJson(heartbeatUrl(identifier)),
    ]);

    const preloadData = parsePreloadData(pageHtml);
    const heartbeatPayload = heartbeatPayloadSchema.parse(rawHeartbeatPayload);
    const pollIntervalMs =
      (preloadData.config.autoRefreshInterval ?? defaultPollIntervalMs / 1000) *
      1000;
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
  }

  async getStatus(identifier: string): Promise<UptimeSnapshot> {
    const url = statusPageUrl(identifier);

    try {
      return await this.getStatusOrThrow(identifier);
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
