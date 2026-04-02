import type { AnalyticsStatusDistributionEntry } from "@/features/analytics/server/analyticsService";

export function formatStatusLabel(status: string) {
  return status.replace("_", " ");
}

export function formatTrendDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTicketCount(value: number) {
  return `${value} ticket${value === 1 ? "" : "s"}`;
}

export function getTrendScale(maxValue: number) {
  const roughStep = maxValue <= 10 ? 10 : Math.ceil(maxValue / 4 / 10) * 10;
  const step = Math.max(10, roughStep);
  const axisMax = Math.max(step * 3, Math.ceil(maxValue / step) * step);
  const ticks = Array.from(
    { length: Math.floor(axisMax / step) + 1 },
    (_, index) => index * step,
  );

  return { axisMax, ticks };
}

export function statusTone(status: AnalyticsStatusDistributionEntry["status"]) {
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
