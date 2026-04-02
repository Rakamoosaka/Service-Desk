"use client";

import type { Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import type { AnalyticsDashboard } from "@/features/analytics/server/analyticsService";
import {
  formatStatusLabel,
  statusTone,
} from "@/features/analytics/components/analyticsDashboard.utils";

interface AnalyticsApplicationsCardProps {
  applications: AnalyticsDashboard["summary"]["ticketsPerApplication"];
}

export function AnalyticsApplicationsCard({
  applications,
}: AnalyticsApplicationsCardProps) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <CardEyebrow>Applications</CardEyebrow>
            <CardTitle className="text-white">
              Tickets per application
            </CardTitle>
            <p className="text-muted-foreground max-w-2xl text-[13px] leading-6">
              Applications are ranked by ticket volume within the current window
              so you can spot where support load is clustering.
            </p>
          </div>
          <Badge tone="neutral">{applications.length} active services</Badge>
        </div>

        {applications.length ? (
          <div className="space-y-3">
            {applications.map((application, index) => (
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
  );
}
