"use client";
import { Activity, ExternalLink, Radar, Siren } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils";
import type {
  UptimeIncidentSnapshot,
  UptimeSnapshot,
  UptimeState,
} from "@/features/uptime/server/uptimeTypes";

function statusTone(status: UptimeState) {
  switch (status) {
    case "operational":
      return "success" as const;
    case "degraded":
      return "warning" as const;
    case "outage":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function incidentTone(status: UptimeIncidentSnapshot["status"]) {
  switch (status) {
    case "resolved":
      return "success" as const;
    case "investigating":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatLatency(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value)} ms`;
}

interface ApplicationUptimePanelProps {
  applicationSlug: string;
  initialSnapshot: UptimeSnapshot;
}

export function ApplicationUptimePanel({
  applicationSlug,
  initialSnapshot,
}: ApplicationUptimePanelProps) {
  const uptimeQuery = useQuery({
    queryKey: queryKeys.uptime(applicationSlug),
    queryFn: () => fetchJson<UptimeSnapshot>(`/api/uptime/${applicationSlug}`),
    initialData: initialSnapshot,
    refetchInterval: (query) => {
      const interval = query.state.data?.pollIntervalMs ?? 60_000;
      return interval > 0 ? interval : false;
    },
    refetchIntervalInBackground: true,
  });

  const snapshot = uptimeQuery.data;

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <CardEyebrow>Service health</CardEyebrow>
            <CardTitle className="text-white">Live uptime overview</CardTitle>
            <p className="text-muted-foreground max-w-2xl text-sm leading-7">
              {snapshot.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge tone={statusTone(snapshot.status)}>{snapshot.status}</Badge>
            {snapshot.statusPageUrl ? (
              <a
                href={snapshot.statusPageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] uppercase"
              >
                Open monitor
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="border-border bg-muted/35 rounded-[18px] border p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
              <span>Source</span>
              <Radar className="size-4" />
            </div>
            <p className="mt-3 font-semibold text-white">{snapshot.source}</p>
          </div>

          <div className="border-border bg-muted/35 rounded-[18px] border p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
              <span>Last checked</span>
              <Activity className="size-4" />
            </div>
            <p className="mt-3 font-semibold text-white">
              {formatDate(snapshot.checkedAt)}
            </p>
          </div>

          <div className="border-border bg-muted/35 rounded-[18px] border p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
              <span>Polling</span>
              <Siren className="size-4" />
            </div>
            <p className="mt-3 font-semibold text-white">
              {snapshot.pollIntervalMs > 0
                ? `Every ${Math.round(snapshot.pollIntervalMs / 1000)}s`
                : "Disabled"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-white/70 uppercase">
              Monitors
            </p>
            <p className="text-muted-foreground text-xs">
              {snapshot.monitors.length} configured
            </p>
          </div>

          {snapshot.monitors.length ? (
            <div className="space-y-3">
              {snapshot.monitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="border-border bg-muted/40 rounded-[18px] border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{monitor.name}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {monitor.checkedAt
                          ? `Last heartbeat ${formatDate(monitor.checkedAt)}`
                          : "No heartbeat received yet"}
                      </p>
                    </div>

                    <Badge tone={statusTone(monitor.status)}>
                      {monitor.status}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-black/15 px-3 py-3">
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                        24h uptime
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        {formatPercent(monitor.uptimeRatio24h)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black/15 px-3 py-3">
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Latest latency
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        {formatLatency(monitor.responseTimeMs)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
              No public monitors are available for this service yet.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-white/70 uppercase">
              Recent incidents
            </p>
            <p className="text-muted-foreground text-xs">
              {snapshot.incidents.length} recorded
            </p>
          </div>

          {snapshot.incidents.length ? (
            <div className="space-y-3">
              {snapshot.incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border-border bg-muted/40 rounded-[18px] border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{incident.title}</p>
                    <Badge tone={incidentTone(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>

                  {incident.summary ? (
                    <p className="text-muted-foreground mt-2 text-sm leading-7">
                      {incident.summary}
                    </p>
                  ) : null}

                  <div className="text-muted-foreground mt-3 flex flex-wrap gap-4 text-xs">
                    {incident.startedAt ? (
                      <span>Started {formatDate(incident.startedAt)}</span>
                    ) : null}
                    {incident.resolvedAt ? (
                      <span>Resolved {formatDate(incident.resolvedAt)}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
              No recent public incidents are available from the status page.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
