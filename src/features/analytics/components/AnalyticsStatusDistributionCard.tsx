"use client";

import { EmptyState } from "@/components/feedback/AsyncStates";
import { Badge } from "@/components/ui/Badge";
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
import { cn } from "@/lib/utils";

interface AnalyticsStatusDistributionCardProps {
  statusDistribution: AnalyticsDashboard["statusDistribution"];
}

export function AnalyticsStatusDistributionCard({
  statusDistribution,
}: AnalyticsStatusDistributionCardProps) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <CardEyebrow>Status split</CardEyebrow>
          <CardTitle className="text-white">Queue composition</CardTitle>
          <p className="text-muted-foreground text-[13px] leading-6">
            Distribution of created tickets in the selected window by current
            status.
          </p>
        </div>

        {statusDistribution.length ? (
          <div className="space-y-4">
            {statusDistribution.map((entry) => (
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
        ) : (
          <EmptyState
            title="No ticket status data in this time range"
            description="Expand the reporting window or wait for new ticket activity to see a status distribution here."
          />
        )}
      </CardContent>
    </Card>
  );
}
