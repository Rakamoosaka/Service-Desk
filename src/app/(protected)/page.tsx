import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { listApplicationsWithServicesCached } from "@/features/applications/server/applicationService";
import { getServiceUptime } from "@/features/uptime/server/uptimeService";
import type { UptimeState } from "@/features/uptime/server/uptimeTypes";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

function normalizeStatus(status: UptimeState) {
  return status === "stale" ? "unknown" : status;
}

function statusTone(status: ReturnType<typeof normalizeStatus>) {
  switch (status) {
    case "operational":
      return "success" as const;
    case "degraded":
      return "warning" as const;
    case "outage":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(status: ReturnType<typeof normalizeStatus>) {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "outage":
      return "Outage";
    default:
      return "Unknown";
  }
}

function aggregateStatus(statuses: Array<ReturnType<typeof normalizeStatus>>) {
  if (!statuses.length) {
    return "unknown" as const;
  }

  if (statuses.includes("outage")) {
    return "outage" as const;
  }

  if (statuses.includes("degraded")) {
    return "degraded" as const;
  }

  if (statuses.every((status) => status === "operational")) {
    return "operational" as const;
  }

  if (statuses.includes("unknown")) {
    return "unknown" as const;
  }

  return "operational" as const;
}

export default async function HomePage() {
  const session = await requireUser();
  const applications = await listApplicationsWithServicesCached();
  const applicationsWithStatus = await Promise.all(
    applications.map(async (application) => {
      const services = await Promise.all(
        application.services.map(async (service) => {
          const snapshot = await getServiceUptime(service.uptimeKumaIdentifier);
          const healthStatus = normalizeStatus(snapshot.status);

          return {
            id: service.id,
            name: service.name,
            slug: service.slug,
            healthStatus,
            healthLabel: statusLabel(healthStatus),
            checkedAt:
              service.uptimeKumaIdentifier && snapshot.monitors.length
                ? snapshot.checkedAt
                : null,
            statusPageUrl: snapshot.statusPageUrl,
          };
        }),
      );

      const counts = services.reduce(
        (result, service) => {
          result[service.healthStatus] += 1;
          return result;
        },
        {
          operational: 0,
          degraded: 0,
          outage: 0,
          unknown: 0,
        },
      );

      const overallStatus = aggregateStatus(
        services.map((service) => service.healthStatus),
      );

      return {
        ...application,
        services,
        counts,
        overallStatus,
        overallLabel: statusLabel(overallStatus),
      };
    }),
  );

  const totals = applicationsWithStatus.reduce(
    (result, application) => {
      result.applications += 1;
      result.services += application.services.length;
      result.outages += application.counts.outage;
      result.degraded += application.counts.degraded;
      return result;
    },
    {
      applications: 0,
      services: 0,
      outages: 0,
      degraded: 0,
    },
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-10 px-6 py-8 md:px-8 md:py-10 xl:px-10">
      <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(135deg,rgba(13,215,242,0.16),rgba(255,34,68,0.1)_46%,rgba(8,18,23,0.96))] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:px-8 md:py-10">
        <div className="panel-grid absolute inset-0 opacity-25" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
        <div className="relative grid gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold tracking-[0.36em] text-white/70 uppercase">
                Shared landing
              </p>
              <div className="space-y-4">
                <h1 className="display-face max-w-4xl text-5xl leading-[0.9] font-semibold tracking-[-0.05em] text-white md:text-7xl">
                  Start the request, not the dashboard.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                  Everyone lands in the same place now. Open the intake form in
                  one step, then check live application status further down the
                  page before you submit.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/request">
                  <Sparkles className="size-4" />
                  Start a form
                </Link>
              </Button>

              {session.user.role === "admin" ? (
                <Button asChild variant="secondary" size="lg">
                  <Link href="/admin">
                    <ShieldCheck className="size-4" />
                    Open admin dashboard
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm sm:col-span-1 xl:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                Signed in as
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {session.user.name}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/65">
                <span>{session.user.email}</span>
                <Badge
                  tone={session.user.role === "admin" ? "accent" : "neutral"}
                >
                  {session.user.role}
                </Badge>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                Applications
              </p>
              <p className="display-face mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                {totals.applications}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                Services tracked
              </p>
              <p className="display-face mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                {totals.services}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                Attention needed
              </p>
              <p className="display-face mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                {totals.outages + totals.degraded}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-3">
            <p className="text-accent text-[11px] font-semibold tracking-[0.32em] uppercase">
              Uptime status
            </p>
            <h2 className="display-face text-4xl font-semibold tracking-[-0.04em] text-white">
              Live application health at the bottom, exactly where it belongs.
            </h2>
          </div>

          <Button asChild variant="secondary">
            <Link href="/request">
              Start a form
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {applicationsWithStatus.map((application) => (
            <Card key={application.id}>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(application.overallStatus)}>
                        {application.overallLabel}
                      </Badge>
                      <Badge tone="neutral">/{application.slug}</Badge>
                    </div>

                    <div>
                      <h3 className="display-face text-3xl font-semibold tracking-[-0.03em] text-white">
                        {application.name}
                      </h3>
                      <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
                        {application.description}
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/request?app=${application.slug}` as Route}>
                      Open form
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div className="border-border bg-muted/45 rounded-[18px] border p-4">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Services
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {application.services.length}
                    </p>
                  </div>
                  <div className="border-accent/30 bg-accent/10 rounded-[18px] border p-4">
                    <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Operational
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {application.counts.operational}
                    </p>
                  </div>
                  <div className="border-warning/30 bg-warning/10 rounded-[18px] border p-4">
                    <p className="text-warning text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Degraded
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {application.counts.degraded}
                    </p>
                  </div>
                  <div className="border-destructive/30 bg-destructive/10 rounded-[18px] border p-4">
                    <p className="text-destructive text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Outage
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {application.counts.outage}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {application.services.length ? (
                    application.services.map((service) => (
                      <div
                        key={service.id}
                        className="border-border bg-muted/45 rounded-[18px] border p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">
                            {service.name}
                          </p>
                          <Badge tone={statusTone(service.healthStatus)}>
                            {service.healthLabel}
                          </Badge>
                          <Badge tone="neutral">/{service.slug}</Badge>
                        </div>

                        <p className="text-muted-foreground mt-3 text-sm leading-7">
                          {service.checkedAt
                            ? `Last checked ${formatDate(service.checkedAt)}`
                            : "No live monitor check has been recorded yet."}
                        </p>

                        {service.statusPageUrl ? (
                          <a
                            href={service.statusPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent mt-3 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase"
                          >
                            Open monitor
                            <ArrowRight className="size-4" />
                          </a>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
                      No services are mapped to this application yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
