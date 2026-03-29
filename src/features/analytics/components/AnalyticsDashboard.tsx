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
      <CardContent className="space-y-6">
        <div className="text-muted-foreground flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase">
            {label}
          </span>
          <Icon className="size-5" />
        </div>
        <div className="space-y-2">
          <p className="display-face data-face text-5xl leading-none font-semibold text-white md:text-6xl">
            {value}
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            {supporting}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ range, data }: AnalyticsDashboardProps) {
  const maxTrendValue = Math.max(...data.trend.map((point) => point.value), 1);
  const windowStartLabel = data.trend[0]?.label ?? "Start";
  const windowMidLabel =
    data.trend[Math.floor((data.trend.length - 1) / 2)]?.label ?? "Mid";
  const windowEndLabel = data.trend[data.trend.length - 1]?.label ?? "Today";

  return (
    <div className="space-y-8">
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
        <Badge tone="accent">Live DB aggregates</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <CardEyebrow>Ticket trend</CardEyebrow>
                <CardTitle className="text-white">Daily intake curve</CardTitle>
                <p className="text-muted-foreground max-w-2xl text-sm leading-7">
                  Each column represents tickets created on a given day. The
                  view is read directly from the database for the selected
                  period.
                </p>
              </div>
              <Badge tone="neutral">{data.summary.days}-day window</Badge>
            </div>

            {data.trend.some((point) => point.value > 0) ? (
              <>
                <div className="border-border/70 bg-muted/35 rounded-[22px] border px-4 py-5">
                  <div className="flex h-64 items-end gap-2">
                    {data.trend.map((point) => (
                      <div
                        key={point.date}
                        className="group flex h-full flex-1 items-end"
                      >
                        <div
                          className="from-accent/30 via-accent to-accent/75 group-hover:via-accent group-hover:to-accent w-full rounded-t-xl border border-white/8 bg-linear-to-t transition duration-200 group-hover:from-white/40"
                          style={{
                            height: `${Math.max((point.value / maxTrendValue) * 100, 6)}%`,
                          }}
                          title={`${point.label}: ${point.value} tickets`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-muted-foreground grid grid-cols-3 text-[11px] font-semibold tracking-[0.24em] uppercase">
                  <span>{windowStartLabel}</span>
                  <span className="text-center">{windowMidLabel}</span>
                  <span className="text-right">{windowEndLabel}</span>
                </div>
              </>
            ) : (
              <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
                No ticket activity was recorded in this time range.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <CardEyebrow>Status split</CardEyebrow>
              <CardTitle className="text-white">Queue composition</CardTitle>
              <p className="text-muted-foreground text-sm leading-7">
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
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <CardEyebrow>Applications</CardEyebrow>
              <CardTitle className="text-white">
                Tickets per application
              </CardTitle>
              <p className="text-muted-foreground max-w-2xl text-sm leading-7">
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
                  className="border-border bg-muted/35 rounded-[20px] border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                        Rank {index + 1}
                      </p>
                      <div>
                        <p className="font-semibold text-white">
                          {application.name}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          /{application.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="data-face text-2xl font-semibold text-white">
                          {application.ticketCount}
                        </p>
                        <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                          {application.share}% of window
                        </p>
                      </div>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/app/${application.slug}` as Route}>
                          Open application
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
              No services recorded ticket volume in this time range.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
