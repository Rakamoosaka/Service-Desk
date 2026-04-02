"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StateSurfaceProps {
  className?: string;
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

interface NoticeProps {
  className?: string;
  tone?: "neutral" | "danger";
  title: string;
  description: string;
  action?: ReactNode;
}

interface RouteLoadingStateProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

interface RouteErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
  retryLabel?: string;
}

interface TableSkeletonProps {
  className?: string;
  columns: number;
  columnTemplate: string;
  rows?: number;
  headerWidths?: string[];
  bodyWidths?: string[];
  secondaryLineColumns?: number[];
  secondaryLineWidths?: string[];
}

interface CardStackSkeletonProps {
  className?: string;
  count?: number;
}

function StateSurface({
  className,
  icon,
  title,
  description,
  action,
}: StateSurfaceProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/35 flex flex-col gap-4 rounded-[18px] border border-dashed p-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="bg-panel text-foreground/80 border-border/70 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-foreground text-[13px] font-semibold">{title}</p>
          <p className="text-muted-foreground mt-2 max-w-2xl text-[13px] leading-6">
            {description}
          </p>
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  className,
  title = "Loading data",
  description = "Fetching the latest data for this view.",
}: Omit<StateSurfaceProps, "action" | "icon">) {
  return (
    <StateSurface
      className={className}
      icon={<LoaderCircle className="size-4 animate-spin" />}
      title={title}
      description={description}
    />
  );
}

export function ErrorState({
  className,
  title = "Unable to load this view",
  description = "The request failed before the screen could be rendered.",
  action,
}: Omit<StateSurfaceProps, "icon">) {
  return (
    <StateSurface
      className={className}
      icon={<AlertTriangle className="size-4" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function EmptyState({
  className,
  title,
  description,
  action,
}: Omit<StateSurfaceProps, "icon">) {
  return (
    <StateSurface
      className={className}
      icon={<Inbox className="size-4" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function InlineNotice({
  className,
  tone = "neutral",
  title,
  description,
  action,
}: NoticeProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        tone === "danger"
          ? "border-destructive/30 bg-destructive/10"
          : "border-border bg-muted/30",
        className,
      )}
    >
      <div>
        <p className="text-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          {title}
        </p>
        <p className="text-muted-foreground mt-1 text-[12px] leading-5">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function TableSkeleton({
  className,
  columns,
  columnTemplate,
  rows = 5,
  headerWidths = [],
  bodyWidths = [],
  secondaryLineColumns = [],
  secondaryLineWidths = [],
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "border-border overflow-x-auto overflow-y-hidden rounded-[18px] border",
        className,
      )}
    >
      <div className="min-w-max">
        <div
          className="bg-muted/70 grid gap-3 px-4 py-3"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <div
              key={`header-${index}`}
              className="bg-muted/45 h-3 animate-pulse rounded-full"
              style={{ width: headerWidths[index] ?? "70%" }}
            />
          ))}
        </div>

        <div className="divide-border bg-panel divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid gap-3 px-4 py-4"
              style={{ gridTemplateColumns: columnTemplate }}
            >
              {Array.from({ length: columns }).map((_, columnIndex) => {
                const showSecondaryLine =
                  secondaryLineColumns.includes(columnIndex);

                return (
                  <div
                    key={`cell-${rowIndex}-${columnIndex}`}
                    className="flex min-w-0 items-center"
                  >
                    <div className="w-full space-y-2">
                      <div
                        className="bg-muted/35 h-4 animate-pulse rounded-full"
                        style={{ width: bodyWidths[columnIndex] ?? "80%" }}
                      />
                      {showSecondaryLine ? (
                        <div
                          className="bg-muted/25 h-3 animate-pulse rounded-full"
                          style={{
                            width: secondaryLineWidths[columnIndex] ?? "58%",
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardStackSkeleton({
  className,
  count = 3,
}: CardStackSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`card-skeleton-${index}`}
          className="border-border rounded-3xl border"
        >
          <div className="space-y-4 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="bg-muted/45 h-3 w-20 animate-pulse rounded-full" />
                <div className="bg-muted/35 h-7 w-52 animate-pulse rounded-full" />
                <div className="flex flex-wrap gap-2">
                  <div className="bg-muted/35 h-6 w-28 animate-pulse rounded-full" />
                  <div className="bg-muted/35 h-6 w-24 animate-pulse rounded-full" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 xl:shrink-0">
                <div className="bg-muted/35 h-9 w-28 animate-pulse rounded-lg" />
                <div className="bg-muted/35 h-9 w-24 animate-pulse rounded-lg" />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="bg-muted/30 space-y-2 rounded-2xl px-3.5 py-3">
                <div className="bg-muted/45 h-3 w-20 animate-pulse rounded-full" />
                <div className="bg-muted/35 h-4 w-32 animate-pulse rounded-full" />
              </div>
              <div className="bg-muted/30 space-y-2 rounded-2xl px-3.5 py-3">
                <div className="bg-muted/45 h-3 w-16 animate-pulse rounded-full" />
                <div className="bg-muted/35 h-4 w-32 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="border-border bg-muted/25 rounded-2xl border">
              <div className="border-border/70 flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="bg-muted/45 h-3 w-28 animate-pulse rounded-full" />
                <div className="bg-muted/35 h-3 w-14 animate-pulse rounded-full" />
              </div>
              <div className="divide-border/70 divide-y">
                {Array.from({ length: 2 }).map((_, serviceIndex) => (
                  <div
                    key={`service-skeleton-${index}-${serviceIndex}`}
                    className="flex flex-col gap-3 px-4 py-3"
                  >
                    <div className="bg-muted/35 h-4 w-36 animate-pulse rounded-full" />
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-muted/35 h-5 w-18 animate-pulse rounded-full" />
                      <div className="bg-muted/35 h-5 w-22 animate-pulse rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RouteLoadingState({
  eyebrow = "Loading",
  title = "Preparing this view",
  description = "Fetching the latest data and composing the screen.",
}: RouteLoadingStateProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.28em] uppercase">
          {eyebrow}
        </p>
        <h1 className="display-face text-foreground text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-7">
          {description}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="bg-muted/45 h-4 w-32 animate-pulse rounded-full" />
            <div className="bg-muted/35 h-28 animate-pulse rounded-[18px]" />
            <div className="space-y-3">
              <div className="bg-muted/35 h-24 animate-pulse rounded-[18px]" />
              <div className="bg-muted/35 h-24 animate-pulse rounded-[18px]" />
              <div className="bg-muted/35 h-24 animate-pulse rounded-[18px]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="bg-muted/45 h-4 w-28 animate-pulse rounded-full" />
            <div className="bg-muted/35 h-11 animate-pulse rounded-xl" />
            <div className="bg-muted/35 h-11 animate-pulse rounded-xl" />
            <div className="bg-muted/35 h-28 animate-pulse rounded-[18px]" />
            <div className="bg-muted/35 h-11 w-40 animate-pulse rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RouteErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
}: RouteErrorStateProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <ErrorState
            title={title}
            description={description}
            action={
              <Button variant="secondary" onClick={onRetry}>
                {retryLabel}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
