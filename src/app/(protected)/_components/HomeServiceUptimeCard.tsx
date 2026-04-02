"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  isActive: boolean;
  initialSnapshot: UptimeSnapshot;
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
      return "bg-foreground/18";
  }
}

function historyLabel(status: UptimeState) {
  switch (status) {
    case "operational":
      return "UP";
    case "degraded":
      return "DEGRADED";
    case "outage":
      return "OUTAGE";
    case "stale":
      return "STALE";
    default:
      return "UNKNOWN";
  }
}

function historyLabelClass(status: UptimeState) {
  switch (status) {
    case "operational":
      return "text-emerald-400";
    case "degraded":
      return "text-amber-400";
    case "outage":
      return "text-rose-500";
    case "stale":
      return "text-slate-400";
    default:
      return "text-foreground/72";
  }
}

function formatHistoryTimestamp(value: string | null) {
  if (!value) {
    return "No timestamp";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(" ", " ");
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

  if (uptimeQuery.isLoading && !snapshot) {
    return (
      <div className="border-border bg-muted/25 text-foreground/80 flex items-center gap-3 border-b px-4 py-4 text-sm last:border-b-0 md:px-5 md:py-5">
        <LoaderCircle className="size-4 animate-spin" />
        Loading live uptime data for {serviceName}.
      </div>
    );
  }

  if (uptimeQuery.isError && !snapshot) {
    return (
      <div className="border-border bg-destructive/10 text-foreground/80 flex flex-col gap-3 border-b px-4 py-4 text-sm last:border-b-0 md:px-5 md:py-5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-4" />
          Unable to load live uptime data for {serviceName}.
        </div>
        <div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => uptimeQuery.refetch()}
          >
            Retry fetch
          </Button>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border/70 relative border-b last:border-b-0",
        isActive ? "" : "opacity-70 saturate-50",
      )}
    >
      {uptimeQuery.isFetching ? (
        <div className="border-border/70 text-foreground/58 border-b px-4 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase md:px-5">
          Refreshing live data
        </div>
      ) : null}

      {uptimeQuery.isError ? (
        <div className="bg-destructive/10 border-border/70 text-foreground/72 border-b px-4 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase md:px-5">
          Live refresh failed
        </div>
      ) : null}

      {snapshot.monitors.length ? (
        <div>
          {snapshot.monitors.map((monitor, index) => (
            <div
              key={monitor.id}
              className={cn(
                "relative grid gap-4 px-4 py-4 md:px-5 md:py-5 lg:grid-cols-[0.44fr_0.56fr] lg:items-center",
                index > 0 ? "border-border/70 border-t" : "",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "border-border/70 rounded-full border px-3 py-1 text-xs font-semibold",
                    isActive ? "text-foreground" : "text-foreground/72",
                  )}
                >
                  {formatPercent(monitor.uptimeRatio24h)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-foreground text-[13px] font-semibold md:text-sm">
                      {serviceName}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-semibold tracking-[0.24em] uppercase",
                        snapshot.status === "operational"
                          ? "text-accent"
                          : snapshot.status === "degraded"
                            ? "text-warning"
                            : snapshot.status === "outage"
                              ? "text-destructive"
                              : "text-foreground/50",
                      )}
                    >
                      {snapshot.status}
                    </p>
                    {!isActive ? <Badge tone="warning">inactive</Badge> : null}
                  </div>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {monitor.checkedAt
                      ? `Last heartbeat ${formatDate(monitor.checkedAt)}`
                      : "No heartbeat received yet"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pb-14">
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
                  ).map((point, pointIndex) => (
                    <span
                      key={`${monitor.id}-${pointIndex}`}
                      className="group relative block min-w-0 cursor-default"
                      tabIndex={0}
                      aria-label={`${historyLabel(point.status)} at ${formatHistoryTimestamp(point.checkedAt)}`}
                    >
                      <span
                        className="border-border/70 bg-panel pointer-events-none absolute top-[calc(100%+10px)] left-1/2 z-10 w-max -translate-x-1/2 rounded-xl border px-3 py-2 text-center opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        <span
                          className={cn(
                            "block text-[11px] font-semibold tracking-[0.16em] uppercase",
                            historyLabelClass(point.status),
                          )}
                        >
                          {historyLabel(point.status)}
                        </span>
                        <span className="text-foreground/78 mt-1 block text-[11px]">
                          {formatHistoryTimestamp(point.checkedAt)}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "block h-4 min-w-0 rounded-full transition duration-150 group-hover:scale-125 group-focus-visible:scale-125",
                          historyClass(point.status),
                        )}
                      />
                    </span>
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
        <div className="border-border bg-muted/40 text-muted-foreground m-4 rounded-lg border border-dashed p-5 text-sm">
          No public monitors are available for this service yet.
        </div>
      )}
    </div>
  );
}
