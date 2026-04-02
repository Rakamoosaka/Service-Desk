"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Radar, Waves } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/AsyncStates";
import { AnalyticsApplicationsCard } from "@/features/analytics/components/AnalyticsApplicationsCard";
import { AnalyticsStatusDistributionCard } from "@/features/analytics/components/AnalyticsStatusDistributionCard";
import { AnalyticsSummaryCard } from "@/features/analytics/components/AnalyticsSummaryCard";
import { AnalyticsTrendChart } from "@/features/analytics/components/AnalyticsTrendChart";
import type { AnalyticsDashboard as AnalyticsDashboardData } from "@/features/analytics/server/analyticsService";
import type { AnalyticsRange } from "@/features/analytics/schemas/analyticsSchemas";
import { getTrendScale } from "@/features/analytics/components/analyticsDashboard.utils";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

interface AnalyticsDashboardProps {
  range: AnalyticsRange;
  data: AnalyticsDashboardData;
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
        <AnalyticsSummaryCard
          label="Tickets in window"
          value={data.summary.totals.ticketsInRange.toString()}
          supporting={`Average of ${data.summary.totals.averageTicketsPerDay} new tickets per day in the last ${data.summary.days} days.`}
          icon={BarChart3}
        />
        <AnalyticsSummaryCard
          label="Open backlog"
          value={data.summary.totals.backlogTickets.toString()}
          supporting="Tickets that are still open and need review, action, or closure."
          icon={Waves}
        />
        <AnalyticsSummaryCard
          label="Applications touched"
          value={data.summary.totals.applicationsWithActivity.toString()}
          supporting={`${data.summary.totals.totalApplications} applications are tracked in total.`}
          icon={Radar}
        />
        <AnalyticsSummaryCard
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
                <CardTitle>Daily intake curve</CardTitle>
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
                <AnalyticsTrendChart
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

        <AnalyticsStatusDistributionCard
          statusDistribution={data.statusDistribution}
        />
      </div>

      <AnalyticsApplicationsCard
        applications={data.summary.ticketsPerApplication}
      />
    </div>
  );
}
