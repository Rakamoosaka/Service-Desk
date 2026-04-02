"use client";

import { useRef, useState } from "react";
import type { AnalyticsDashboard } from "@/features/analytics/server/analyticsService";
import {
  formatTicketCount,
  formatTrendDate,
} from "@/features/analytics/components/analyticsDashboard.utils";

interface TrendTooltipState {
  date: string;
  value: number;
  x: number;
  y: number;
}

interface AnalyticsTrendChartProps {
  trend: AnalyticsDashboard["trend"];
  axisMax: number;
  ticks: number[];
}

export function AnalyticsTrendChart({
  trend,
  axisMax,
  ticks,
}: AnalyticsTrendChartProps) {
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
