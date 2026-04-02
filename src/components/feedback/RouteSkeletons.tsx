import type { ReactNode } from "react";
import {
  CardStackSkeleton,
  TableSkeleton,
} from "@/components/feedback/AsyncStates";
import { Card, CardContent } from "@/components/ui/Card";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`${className} bg-muted/35 animate-pulse rounded-full`} />
  );
}

function SectionIntroSkeleton({
  showActions = false,
}: {
  showActions?: boolean;
}) {
  return (
    <div className="border-border/80 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-4">
        <SkeletonBlock className="h-3 w-20" />
        <div className="space-y-3">
          <SkeletonBlock className="h-10 w-full max-w-xl md:h-12" />
          <SkeletonBlock className="h-4 w-full max-w-2xl" />
          <SkeletonBlock className="h-4 w-full max-w-xl" />
        </div>
      </div>

      {showActions ? (
        <div className="flex items-center gap-3 self-start lg:self-end">
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
          <SkeletonBlock className="h-10 w-24 rounded-xl" />
        </div>
      ) : null}
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-8 w-20" />
          </div>
          <div className="bg-muted/30 size-10 animate-pulse rounded-2xl" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-7 w-48" />
            <SkeletonBlock className="h-3 w-full max-w-md" />
            <SkeletonBlock className="h-3 w-5/6 max-w-sm" />
          </div>
          <SkeletonBlock className="h-6 w-24" />
        </div>

        <div className="border-border/80 flex h-64 items-end gap-3 overflow-hidden rounded-2xl border border-dashed px-4 py-5">
          {Array.from({ length: 14 }).map((_, index) => (
            <div
              key={`trend-bar-${index}`}
              className="bg-muted/35 w-full animate-pulse rounded-t-full"
              style={{ height: `${36 + ((index * 17) % 60)}%` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="mx-auto h-3 w-16" />
          <SkeletonBlock className="ml-auto h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function SideAnalyticsCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="h-3 w-full" />
        </div>

        <div className="bg-muted/25 border-border/80 mx-auto size-44 animate-pulse rounded-full border border-dashed" />

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`status-line-${index}`}
              className="border-border/70 flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted/35 size-3 animate-pulse rounded-full" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
              <SkeletonBlock className="h-3 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationsListSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-7 w-56" />
          </div>
          <SkeletonBlock className="h-6 w-24" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`application-line-${index}`}
              className="border-border/80 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-4"
            >
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-3 w-56 max-w-full" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-5 w-16" />
                <SkeletonBlock className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EditorCardSkeleton({
  showTextarea = false,
}: {
  showTextarea?: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-7 w-44" />
          <SkeletonBlock className="h-3 w-full" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <div className="bg-muted/25 border-border/80 h-11 animate-pulse rounded-xl border" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-20" />
            <div className="bg-muted/25 border-border/80 h-11 animate-pulse rounded-xl border" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <div
              className={`bg-muted/25 border-border/80 animate-pulse rounded-xl border ${showTextarea ? "h-28" : "h-11"}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
          <SkeletonBlock className="h-10 w-20 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function TicketsToolbarSkeleton() {
  return (
    <div className="border-border/80 space-y-4 rounded-2xl border p-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
        <div className="bg-muted/25 border-border/80 h-11 animate-pulse rounded-xl border" />
        <div className="bg-muted/25 border-border/80 h-11 animate-pulse rounded-xl border" />
        <div className="bg-muted/25 border-border/80 h-11 animate-pulse rounded-xl border" />
        <div className="bg-muted/25 border-border/80 h-11 animate-pulse rounded-xl border" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SkeletonBlock className="h-10 w-36 rounded-xl" />
        <SkeletonBlock className="h-10 w-36 rounded-xl" />
        <SkeletonBlock className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

function AdminNavSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`admin-nav-${index}`}
          className="bg-sidebar-foreground/6 border-sidebar-border h-11 animate-pulse rounded-2xl border"
        />
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 xl:px-6 xl:py-10">
      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
        <aside className="border-border/80 pb-5 xl:sticky xl:top-8 xl:border-r xl:pr-6 xl:pb-0">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>

          <div className="mt-6 flex flex-col items-start gap-3">
            <div className="bg-muted/25 border-border/80 h-10 w-full animate-pulse rounded-xl border" />
            <div className="flex w-full items-center gap-3">
              <div className="bg-muted/25 border-border/80 h-9 flex-1 animate-pulse rounded-xl border" />
              <div className="bg-muted/25 border-border/80 size-10 animate-pulse rounded-full border" />
            </div>
          </div>

          <div className="border-border/80 mt-7 border-t pt-5">
            <div className="border-border bg-panel overflow-hidden rounded-lg border">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`home-stat-${index}`}>
                  <div className="flex items-center justify-between gap-3 px-3 py-3">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="h-6 w-8" />
                  </div>
                  {index < 2 ? (
                    <div className="border-border border-t" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="border-border/80 mt-7 border-t pt-5">
            <div className="flex items-start gap-3">
              <div className="bg-muted/25 border-border/80 size-10 animate-pulse rounded-full border" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-36 max-w-full" />
              </div>
              <div className="bg-muted/25 border-border/80 size-10 animate-pulse rounded-full border" />
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="border-border/80 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
            <div className="space-y-2.5">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-8 w-full max-w-2xl" />
            </div>
          </div>

          <div className="grid gap-3.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`home-card-${index}`}
                className="border-border bg-panel rounded-xl border p-6 md:p-7"
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SkeletonBlock className="h-6 w-24" />
                        <SkeletonBlock className="h-6 w-18" />
                      </div>
                      <div className="space-y-2">
                        <SkeletonBlock className="h-7 w-48" />
                        <SkeletonBlock className="h-3 w-full max-w-xl" />
                        <SkeletonBlock className="h-3 w-3/4 max-w-lg" />
                      </div>
                    </div>

                    <SkeletonBlock className="h-9 w-28 rounded-xl" />
                  </div>

                  <div className="border-border bg-muted/30 overflow-hidden rounded-xl border">
                    <div className="grid md:grid-cols-4">
                      {Array.from({ length: 4 }).map((__, statIndex) => (
                        <div
                          key={`home-card-${index}-stat-${statIndex}`}
                          className="border-border px-4 py-4 md:px-5 md:py-5"
                        >
                          <SkeletonBlock className="h-3 w-20" />
                          <SkeletonBlock className="mt-3 h-8 w-10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ApplicationStatusSkeleton() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 xl:px-6 xl:py-10">
      <div className="space-y-4">
        <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <SkeletonBlock className="h-9 w-36 rounded-xl" />

          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="h-6 w-18" />
          </div>
        </div>

        <div className="border-border/70 rounded-xl border p-6 md:p-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2.5">
                <SkeletonBlock className="h-3 w-28" />

                <div className="space-y-2">
                  <SkeletonBlock className="h-10 w-full max-w-md" />
                  <SkeletonBlock className="h-4 w-full max-w-3xl" />
                  <SkeletonBlock className="h-4 w-5/6 max-w-2xl" />
                </div>
              </div>

              <SkeletonBlock className="h-9 w-28 rounded-xl" />
            </div>

            <div className="border-border/70 bg-muted/35 overflow-hidden rounded-xl border">
              <div className="grid md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`application-status-stat-${index}`}
                    className="border-border/70 px-4 py-4 md:px-5 md:py-5"
                  >
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="mt-3 h-8 w-10" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border/70 bg-muted/30 rounded-2xl border p-4 md:p-5">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`application-service-${index}`}
                    className="bg-panel border-border/80 rounded-2xl border p-4 md:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <SkeletonBlock className="h-5 w-18" />
                          <SkeletonBlock className="h-5 w-24" />
                        </div>
                        <SkeletonBlock className="h-6 w-40" />
                        <SkeletonBlock className="h-3 w-full max-w-lg" />
                      </div>

                      <SkeletonBlock className="h-8 w-24 rounded-xl" />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="bg-muted/30 border-border/70 rounded-xl border px-3 py-3">
                        <SkeletonBlock className="h-3 w-20" />
                        <SkeletonBlock className="mt-2 h-4 w-28" />
                      </div>
                      <div className="bg-muted/30 border-border/70 rounded-xl border px-3 py-3">
                        <SkeletonBlock className="h-3 w-24" />
                        <SkeletonBlock className="mt-2 h-4 w-24" />
                      </div>
                      <div className="bg-muted/30 border-border/70 rounded-xl border px-3 py-3">
                        <SkeletonBlock className="h-3 w-16" />
                        <SkeletonBlock className="mt-2 h-4 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground relative hidden border-r lg:sticky lg:top-0 lg:block lg:h-screen lg:self-start">
        <div className="panel-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col gap-6 overflow-y-auto p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="bg-sidebar-foreground/12 h-3 w-14" />
                <SkeletonBlock className="bg-sidebar-foreground/18 h-7 w-32" />
              </div>
              <div className="bg-sidebar-foreground/10 border-sidebar-border size-10 animate-pulse rounded-full border" />
            </div>
          </div>

          <AdminNavSkeleton />

          <div className="from-sidebar via-sidebar/95 sticky bottom-0 mt-auto space-y-2 bg-linear-to-t to-transparent pt-5">
            <div className="px-1 py-1.5">
              <div className="space-y-2">
                <SkeletonBlock className="bg-sidebar-foreground/18 h-4 w-28" />
                <SkeletonBlock className="bg-sidebar-foreground/12 h-3 w-36" />
              </div>
              <div className="bg-sidebar-foreground/10 border-sidebar-border mt-3 h-9 w-full animate-pulse rounded-xl border" />
            </div>
            <div className="bg-sidebar-foreground/10 border-sidebar-border h-10 animate-pulse rounded-xl border" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-border bg-background/92 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur lg:hidden">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-14" />
            <SkeletonBlock className="h-6 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-muted/25 border-border/80 size-10 animate-pulse rounded-full border" />
            <div className="bg-muted/25 border-border/80 size-10 animate-pulse rounded-full border" />
          </div>
        </header>

        <main className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-6 px-4 py-5 text-[13px] sm:px-5 md:px-6 md:py-8 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminOverviewSkeleton() {
  return (
    <>
      <SectionIntroSkeleton />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-9 w-22 rounded-xl" />
          <SkeletonBlock className="h-9 w-24 rounded-xl" />
          <SkeletonBlock className="h-9 w-24 rounded-xl" />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
          <ChartCardSkeleton />
          <SideAnalyticsCardSkeleton />
        </div>

        <ApplicationsListSkeleton />
      </div>
    </>
  );
}

export function AdminApplicationsSkeleton() {
  return (
    <>
      <SectionIntroSkeleton />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-7 w-52" />
                <SkeletonBlock className="h-3 w-full max-w-xl" />
              </div>
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-20" />
                <SkeletonBlock className="h-6 w-20" />
              </div>
            </div>

            <CardStackSkeleton count={3} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <EditorCardSkeleton showTextarea />
          <EditorCardSkeleton showTextarea />
        </div>
      </div>
    </>
  );
}

export function AdminTicketsSkeleton() {
  return (
    <>
      <SectionIntroSkeleton />

      <Card>
        <CardContent className="space-y-5">
          <TicketsToolbarSkeleton />
          <TableSkeleton
            columns={6}
            columnTemplate="minmax(3rem,0.35fr) minmax(15rem,1.6fr) minmax(9rem,0.9fr) minmax(8rem,0.8fr) minmax(8rem,0.8fr) minmax(10rem,0.9fr)"
            rows={6}
            headerWidths={["30%", "28%", "42%", "40%", "42%", "48%"]}
            bodyWidths={["46%", "78%", "62%", "56%", "54%", "66%"]}
            secondaryLineColumns={[1]}
            secondaryLineWidths={["54%"]}
          />
        </CardContent>
      </Card>
    </>
  );
}

export function AdminUsersSkeleton() {
  return (
    <>
      <SectionIntroSkeleton />

      <Card>
        <CardContent className="space-y-4 overflow-hidden p-0">
          <div className="p-6 md:p-7">
            <TableSkeleton
              columns={4}
              columnTemplate="minmax(15rem,1.4fr) minmax(10rem,1fr) minmax(8rem,0.7fr) minmax(8rem,0.8fr)"
              rows={5}
              headerWidths={["26%", "36%", "28%", "30%"]}
              bodyWidths={["72%", "64%", "58%", "52%"]}
              secondaryLineColumns={[0]}
              secondaryLineWidths={["46%"]}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
