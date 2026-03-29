"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import { cn, formatDate } from "@/lib/utils";
import type {
  UptimeMonitorSnapshot,
  UptimeSnapshot,
  UptimeState,
} from "@/features/uptime/server/uptimeTypes";

interface HomeServiceUptimeCardProps {
  applicationSlug: string;
  serviceSlug: string;
  serviceName: string;
  serviceDescription: string;
  isActive: boolean;
  initialSnapshot: UptimeSnapshot;
}

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

function historyClass(status: UptimeState) {
  switch (status) {
    case "operational":
      return "bg-emerald-400";
    case "degraded":
      return "bg-amber-400";
    case "outage":
      return "bg-rose-500";
    case "stale":
      return "bg-slate-500";
    default:
      return "bg-white/18";
  }
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
}

function formatWindowStart(monitor: UptimeMonitorSnapshot) {
  const start = monitor.history[0]?.checkedAt ?? monitor.checkedAt;

  if (!start) {
    return "--";
  }

  const diffMs = Math.max(0, Date.now() - new Date(start).getTime());
  const minutes = Math.max(1, Math.round(diffMs / 60_000));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes < 1_440) {
    return `${Math.round(minutes / 60)}h`;
  }

  return `${Math.round(minutes / 1_440)}d`;
}

export function HomeServiceUptimeCard({
  applicationSlug,
  serviceSlug,
  serviceName,
  serviceDescription,
  isActive,
  initialSnapshot,
}: HomeServiceUptimeCardProps) {
  const uptimeQuery = useQuery({
    queryKey: queryKeys.uptime(applicationSlug, serviceSlug),
    queryFn: () =>
      fetchJson<UptimeSnapshot>(
        `/api/uptime/${applicationSlug}/${serviceSlug}`,
      ),
    initialData: initialSnapshot,
    refetchInterval: (query) => {
      const interval = query.state.data?.pollIntervalMs ?? 60_000;
      return interval > 0 ? interval : false;
    },
    refetchIntervalInBackground: true,
  });

  const snapshot = uptimeQuery.data;

  return (
    <Card className={isActive ? "" : "opacity-70 saturate-50"}>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white">{serviceName}</p>
              <Badge tone={statusTone(snapshot.status)}>
                {snapshot.status}
              </Badge>
              <Badge tone="neutral">/{serviceSlug}</Badge>
              {!isActive ? <Badge tone="warning">inactive</Badge> : null}
            </div>

            <p className="text-muted-foreground max-w-3xl text-sm leading-7">
              {serviceDescription}
            </p>

            <p className="text-muted-foreground text-xs leading-6">
              {snapshot.monitors.length
                ? `Last refresh ${formatDate(snapshot.checkedAt)}`
                : snapshot.summary}
            </p>
          </div>

          {snapshot.statusPageUrl ? (
            <a
              href={snapshot.statusPageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase"
            >
              Open monitor
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>

        {snapshot.monitors.length ? (
          <div className="space-y-4">
            {snapshot.monitors.map((monitor) => (
              <div
                key={monitor.id}
                className="grid gap-4 rounded-[20px] bg-black/14 px-4 py-4 lg:grid-cols-[0.44fr_0.56fr] lg:items-center"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-full px-3 py-1 text-xl font-semibold",
                      isActive
                        ? "bg-emerald-400 text-black"
                        : "bg-white/12 text-white",
                    )}
                  >
                    {formatPercent(monitor.uptimeRatio24h)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {monitor.name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {monitor.checkedAt
                        ? `Last heartbeat ${formatDate(monitor.checkedAt)}`
                        : "No heartbeat received yet"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid auto-cols-fr grid-flow-col gap-1">
                    {(monitor.history.length
                      ? monitor.history
                      : [
                          {
                            status:
                              monitor.status === "stale"
                                ? "unknown"
                                : monitor.status,
                            checkedAt: monitor.checkedAt,
                          },
                        ]
                    ).map((point, index) => (
                      <span
                        key={`${monitor.id}-${index}`}
                        className={cn(
                          "h-5 min-w-0 rounded-full",
                          historyClass(point.status),
                        )}
                      />
                    ))}
                  </div>

                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>{formatWindowStart(monitor)}</span>
                    <span>now</span>
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
      </CardContent>
    </Card>
  );
}
