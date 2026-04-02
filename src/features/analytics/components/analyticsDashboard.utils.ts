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

function getNiceTickStep(maxValue: number) {
  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;

  if (normalizedStep <= 1) {
    return magnitude;
  }

  if (normalizedStep <= 2) {
    return 2 * magnitude;
  }

  if (normalizedStep <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

export function getTrendScale(maxValue: number) {
  const safeMaxValue = Math.max(maxValue, 1);

  if (safeMaxValue <= 4) {
    return {
      axisMax: safeMaxValue,
      ticks: Array.from({ length: safeMaxValue + 1 }, (_, index) => index),
    };
  }

  const step = getNiceTickStep(safeMaxValue);
  const axisMax = Math.ceil(safeMaxValue / step) * step;
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
