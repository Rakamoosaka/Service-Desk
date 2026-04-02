import JSON5 from "json5";
import { env } from "@/lib/env";
import {
  preloadDataPattern,
  preloadDataSchema,
} from "@/features/uptime/server/uptimeKumaStatusPage.schemas";

export function statusPageUrl(identifier: string) {
  if (!env.UPTIME_KUMA_BASE_URL) {
    return null;
  }

  return new URL(`/status/${identifier}`, env.UPTIME_KUMA_BASE_URL).toString();
}

export function heartbeatUrl(identifier: string) {
  return new URL(
    `/api/status-page/heartbeat/${identifier}`,
    env.UPTIME_KUMA_BASE_URL,
  ).toString();
}

export async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Uptime fetch failed with status ${response.status}`);
  }

  return response.text();
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Uptime fetch failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function parsePreloadData(html: string) {
  const match = html.match(preloadDataPattern);

  if (!match?.[1]) {
    throw new Error("Unable to locate Uptime Kuma preload data");
  }

  return preloadDataSchema.parse(JSON5.parse(match[1]));
}
