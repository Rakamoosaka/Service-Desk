"use client";

import { useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Radar,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/AsyncStates";
import type {
  AnalyticsDashboard as AnalyticsDashboardData,
  AnalyticsStatusDistributionEntry,
} from "@/features/analytics/server/analyticsService";
import type { AnalyticsRange } from "@/features/analytics/schemas/analyticsSchemas";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

function formatStatusLabel(status: string) {
  return status.replace("_", " ");
}

function formatTrendDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTicketCount(value: number) {
  return `${value} ticket${value === 1 ? "" : "s"}`;
}

function getTrendScale(maxValue: number) {
  const roughStep = maxValue <= 10 ? 10 : Math.ceil(maxValue / 4 / 10) * 10;
  const step = Math.max(10, roughStep);
  const axisMax = Math.max(step * 3, Math.ceil(maxValue / step) * step);
  const ticks = Array.from(
    { length: Math.floor(axisMax / step) + 1 },
    (_, index) => index * step,
  );

  return { axisMax, ticks };
}

function statusTone(status: AnalyticsStatusDistributionEntry["status"]) {
  switch (status) {
    case "new":
      return "info" as const;
    case "in_review":
      return "warning" as const;
    case "resolved":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

interface AnalyticsDashboardProps {
  range: AnalyticsRange;
  data: AnalyticsDashboardData;
}

interface TrendChartProps {
  trend: AnalyticsDashboardData["trend"];
  axisMax: number;
  ticks: number[];
}

interface TrendTooltipState {
  date: string;
  value: number;
  x: number;
  y: number;
}

function SummaryCard({
  label,
  value,
  supporting,
  icon: Icon,
}: {
  label: string;
  value: string;
  supporting: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="text-muted-foreground flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
            {label}
          </span>
          <Icon className="size-4.5" />
        </div>
        <div className="space-y-2">
          <p className="display-face data-face text-4xl leading-none font-semibold text-white md:text-5xl">
            {value}
          </p>
          <p className="text-muted-foreground text-[13px] leading-5.5">
            {supporting}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendChart({ trend, axisMax, ticks }: TrendChartProps) {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TrendTooltipState | null>(null);

  function showTooltip(
    event: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>,
    date: string,
    value: number,
  ) {
    const bounds = plotRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const isMouseEvent = "clientX" in event;
    const pointX = isMouseEvent
      ? event.clientX - bounds.left
      : event.currentTarget.getBoundingClientRect().left -
        bounds.left +
        event.currentTarget.getBoundingClientRect().width / 2;
    const pointY = isMouseEvent
      ? event.clientY - bounds.top
      : event.currentTarget.getBoundingClientRect().top - bounds.top;

    const tooltipWidth = 156;
    const tooltipHeight = 56;
    const nextX = Math.min(
      Math.max(pointX + 14, 12),
      bounds.width - tooltipWidth - 12,
    );
    const nextY = Math.max(pointY - tooltipHeight - 12, 10);

    setTooltip({ date, value, x: nextX, y: nextY });
  }

  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
      <div className="relative h-56">
        {ticks.map((tick) => (
          <div
            key={tick}
            className="text-muted-foreground absolute left-0 text-[10px] font-medium tabular-nums"
            style={{
              bottom: `${(tick / axisMax) * 100}%`,
              transform: "translateY(50%)",
            }}
          >
            {tick}
          </div>
        ))}
      </div>

      <div className="border-border/70 bg-muted/35 rounded-[18px] border px-4 py-4">
        <div ref={plotRef} className="relative h-56">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="border-border/60 pointer-events-none absolute inset-x-0 border-t"
              style={{ bottom: `${(tick / axisMax) * 100}%` }}
            />
          ))}

          {tooltip ? (
            <div
              className="pointer-events-none absolute z-10 w-max rounded-lg border border-white/10 bg-[#111111] px-2.5 py-2 text-left shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
              style={{ left: tooltip.x, top: tooltip.y }}
              aria-hidden="true"
            >
              <p className="text-[11px] font-semibold text-white">
                {formatTrendDate(tooltip.date)}
              </p>
              <p className="text-muted-foreground mt-1 text-[10px] font-medium tracking-[0.14em] uppercase">
                {formatTicketCount(tooltip.value)}
              </p>
            </div>
          ) : null}

          <div
            className="relative grid h-full items-end gap-px md:gap-1"
            style={{
              gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))`,
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            {trend.map((point) => (
              <div
                key={point.date}
                className="group relative flex h-full min-w-0 items-end"
                tabIndex={0}
                onMouseMove={(event) =>
                  showTooltip(event, point.date, point.value)
                }
                onFocus={(event) => showTooltip(event, point.date, point.value)}
                onBlur={() => setTooltip(null)}
                aria-label={`${formatTrendDate(point.date)}: ${formatTicketCount(point.value)}`}
              >
                <div
                  className="from-accent/30 via-accent to-accent/75 group-hover:via-accent group-hover:to-accent group-focus-visible:via-accent group-focus-visible:to-accent w-full rounded-t-lg border border-white/8 bg-linear-to-t transition duration-200 group-hover:from-white/40 group-focus-visible:from-white/40"
                  style={{
                    height: `${Math.max((point.value / axisMax) * 100, 6)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ range, data }: AnalyticsDashboardProps) {
  const maxTrendValue = Math.max(...data.trend.map((point) => point.value), 1);
  const { axisMax, ticks } = getTrendScale(maxTrendValue);
  const windowStartLabel = data.trend[0]?.label ?? "Start";
  const windowMidLabel =
    data.trend[Math.floor((data.trend.length - 1) / 2)]?.label ?? "Mid";
  const windowEndLabel = data.trend[data.trend.length - 1]?.label ?? "Today";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            asChild
            variant={option.value === range ? "primary" : "secondary"}
            size="sm"
          >
            <Link href={`/admin?range=${option.value}`}>{option.label}</Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Tickets in window"
          value={data.summary.totals.ticketsInRange.toString()}
          supporting={`Average of ${data.summary.totals.averageTicketsPerDay} new tickets per day in the last ${data.summary.days} days.`}
          icon={BarChart3}
        />
        <SummaryCard
          label="Open backlog"
          value={data.summary.totals.backlogTickets.toString()}
          supporting="Tickets that are still open and need review, action, or closure."
          icon={Waves}
        />
        <SummaryCard
          label="Applications touched"
          value={data.summary.totals.applicationsWithActivity.toString()}
          supporting={`${data.summary.totals.totalApplications} applications are tracked in total.`}
          icon={Radar}
        />
        <SummaryCard
          label="Total tickets"
          value={data.summary.totals.totalTickets.toString()}
          supporting="All tickets recorded in this workspace."
          icon={ArrowRight}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <CardEyebrow>Ticket trend</CardEyebrow>
                <CardTitle className="text-white">Daily intake curve</CardTitle>
                <p className="text-muted-foreground max-w-2xl text-[13px] leading-6">
                  Each column represents tickets created on a given day. The
                  view is read directly from the database for the selected
                  period.
                </p>
              </div>
              <Badge tone="neutral">{data.summary.days}-day window</Badge>
            </div>

            {data.trend.some((point) => point.value > 0) ? (
              <>
                <TrendChart
                  trend={data.trend}
                  axisMax={axisMax}
                  ticks={ticks}
                />

                <div className="text-muted-foreground grid grid-cols-3 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  <span>{windowStartLabel}</span>
                  <span className="text-center">{windowMidLabel}</span>
                  <span className="text-right">{windowEndLabel}</span>
                </div>
              </>
            ) : (
              <EmptyState
                title="No ticket activity in this time range"
                description="Expand the reporting window or wait for new submissions to see trend data here."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <CardEyebrow>Status split</CardEyebrow>
              <CardTitle className="text-white">Queue composition</CardTitle>
              <p className="text-muted-foreground text-[13px] leading-6">
                Distribution of created tickets in the selected window by
                current status.
              </p>
            </div>

            <div className="space-y-4">
              {data.statusDistribution.map((entry) => (
                <div key={entry.status} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(entry.status)}>
                        {formatStatusLabel(entry.status)}
                      </Badge>
                    </div>
                    <p className="data-face text-sm font-semibold text-white">
                      {entry.value}{" "}
                      <span className="text-muted-foreground">
                        ({entry.share}%)
                      </span>
                    </p>
                  </div>
                  <div className="bg-muted h-2.5 rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-200",
                        entry.status === "new" && "bg-info",
                        entry.status === "in_review" && "bg-warning",
                        entry.status === "resolved" && "bg-accent",
                        entry.status === "closed" && "bg-muted-foreground/70",
                      )}
                      style={{
                        width: `${Math.max(entry.share, entry.value > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <CardEyebrow>Applications</CardEyebrow>
              <CardTitle className="text-white">
                Tickets per application
              </CardTitle>
              <p className="text-muted-foreground max-w-2xl text-[13px] leading-6">
                Applications are ranked by ticket volume within the current
                window so you can spot where support load is clustering.
              </p>
            </div>
            <Badge tone="neutral">
              {data.summary.ticketsPerApplication.length} active services
            </Badge>
          </div>

          {data.summary.ticketsPerApplication.length ? (
            <div className="space-y-3">
              {data.summary.ticketsPerApplication.map((application, index) => (
                <div
                  key={application.applicationId}
                  className="border-border bg-muted/35 rounded-[18px] border p-3.5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
                          Rank {index + 1}
                        </p>
                        <div className="space-y-1">
                          <p className="text-lg leading-tight font-semibold text-white sm:text-xl">
                            {application.name}
                          </p>
                          <p className="text-muted-foreground/80 text-xs sm:text-sm">
                            /{application.slug}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="data-face text-3xl leading-none font-semibold text-white sm:text-4xl">
                          {application.ticketCount}
                        </p>
                        <p className="text-muted-foreground mt-2 text-[10px] tracking-[0.16em] uppercase">
                          {application.share}% of window
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {application.statuses
                          .filter((statusEntry) => statusEntry.value > 0)
                          .map((statusEntry) => (
                            <Badge
                              key={statusEntry.status}
                              tone={statusTone(statusEntry.status)}
                            >
                              {formatStatusLabel(statusEntry.status)}:{" "}
                              {statusEntry.value}
                            </Badge>
                          ))}
                      </div>

                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="ml-auto"
                      >
                        <Link href={`/app/${application.slug}` as Route}>
                          Open application
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No application activity in this time range"
              description="No applications recorded ticket volume in the selected reporting window."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
