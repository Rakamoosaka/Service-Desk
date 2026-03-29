import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { getApplicationBySlugCached } from "@/features/applications/server/applicationService";
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";
import {
  buildServiceUptimeSnapshot,
  getApplicationUptime,
} from "@/features/uptime/server/uptimeService";
import type {
  UptimeMonitorSnapshot,
  UptimeState,
} from "@/features/uptime/server/uptimeTypes";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

interface ApplicationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const requestLanes = [
  {
    type: "bug" as const,
    eyebrow: "Issue lane",
    title: "Report an issue",
    description:
      "Use this when something is broken, failing, or blocking work.",
    submitLabel: "Send issue report",
    titleLabel: "Issue title",
    titlePlaceholder: "Summarize the problem",
    descriptionLabel: "What happened",
    descriptionPlaceholder:
      "Describe what broke, how to reproduce it, and what impact it had on your work.",
    serviceLabel: "Affected service",
    serviceHelpText:
      "Choose the specific service if the issue is isolated. Leave it blank if the whole application feels affected.",
  },
  {
    type: "suggestion" as const,
    eyebrow: "Change lane",
    title: "Request a change",
    description:
      "Use this for workflow improvements, missing capabilities, or feature requests.",
    submitLabel: "Send change request",
    titleLabel: "Change title",
    titlePlaceholder: "Name the improvement you want",
    descriptionLabel: "Requested change",
    descriptionPlaceholder:
      "Explain the change, why it matters, and what would be better once it exists.",
    serviceLabel: "Related service",
    serviceHelpText:
      "Choose a service if the request belongs to one part of the product. Leave blank for broader application changes.",
  },
  {
    type: "feedback" as const,
    eyebrow: "Feedback lane",
    title: "Share feedback",
    description:
      "Use this for friction points, praise, and smaller notes that help improve the experience.",
    submitLabel: "Send feedback",
    titleLabel: "Feedback title",
    titlePlaceholder: "Summarize your feedback",
    descriptionLabel: "Feedback details",
    descriptionPlaceholder:
      "Tell us what felt smooth, what felt rough, and any context that would help the team understand it.",
    serviceLabel: "Related service",
    serviceHelpText:
      "Choose a service only if your feedback is tied to one area. Otherwise leave it at the application level.",
  },
];

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

function averageMetric(
  monitors: UptimeMonitorSnapshot[],
  key: "responseTimeMs" | "uptimeRatio24h",
) {
  const values = monitors
    .map((monitor) => monitor[key])
    .filter((value): value is number => value !== null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default async function ApplicationPage({
  params,
}: ApplicationPageProps) {
  await requireUser();
  const { slug } = await params;
  const application = await getApplicationBySlugCached(slug);

  if (!application) {
    notFound();
  }

  const applicationSnapshot = await getApplicationUptime(
    application.uptimeKumaIdentifier,
  );
  const activeServices = application.services.filter(
    (service) => service.isActive,
  );

  const servicesWithStatus = await Promise.all(
    application.services.map(async (service) => {
      const snapshot = buildServiceUptimeSnapshot(
        applicationSnapshot,
        service.kumaMonitorId,
        service.name,
      );
      const healthStatus = normalizeStatus(snapshot.status);

      return {
        ...service,
        healthStatus,
        healthLabel: statusLabel(healthStatus),
        monitorCount: snapshot.monitors.length,
        averageLatencyMs: averageMetric(snapshot.monitors, "responseTimeMs"),
        uptimeRatio24h: averageMetric(snapshot.monitors, "uptimeRatio24h"),
        checkedAt: snapshot.monitors.length ? snapshot.checkedAt : null,
        statusPageUrl: snapshot.statusPageUrl,
        summary: snapshot.summary,
      };
    }),
  );

  const serviceStatusCounts = servicesWithStatus.reduce(
    (counts, service) => {
      counts[service.healthStatus] += 1;
      return counts;
    },
    {
      operational: 0,
      degraded: 0,
      outage: 0,
      unknown: 0,
    },
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-8 px-6 py-8 md:px-8 md:py-10 xl:px-10">
      <SectionIntro
        eyebrow="Application"
        title={application.name}
        description={
          application.description +
          " Report problems, request improvements, share feedback, and check service health from one workspace."
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <CardEyebrow>Support workspace</CardEyebrow>
                <CardTitle className="text-white">
                  Choose the request lane that matches what you need
                </CardTitle>
                <p className="text-muted-foreground max-w-3xl text-sm leading-7">
                  Each form goes to the same service desk, but choosing the
                  right lane makes triage faster and keeps your request easier
                  to understand.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="border-accent/30 bg-accent/10 rounded-[18px] border p-4">
                  <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">
                    Operational
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {serviceStatusCounts.operational}
                  </p>
                </div>

                <div className="border-warning/30 bg-warning/10 rounded-[18px] border p-4">
                  <p className="text-warning text-[11px] font-semibold tracking-[0.24em] uppercase">
                    Degraded
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {serviceStatusCounts.degraded}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  <div className="border-destructive/30 bg-destructive/10 rounded-[18px] border p-4">
                    <p className="text-destructive text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Outage
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {serviceStatusCounts.outage}
                    </p>
                  </div>

                  <div className="border-border bg-muted/45 rounded-[18px] border p-4">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Unknown
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {serviceStatusCounts.unknown}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5">
            {requestLanes.map((lane) => (
              <TicketIntakeForm
                key={lane.type}
                applicationId={application.id}
                services={activeServices}
                fixedType={lane.type}
                eyebrow={lane.eyebrow}
                title={lane.title}
                description={lane.description}
                submitLabel={lane.submitLabel}
                titleLabel={lane.titleLabel}
                titlePlaceholder={lane.titlePlaceholder}
                descriptionLabel={lane.descriptionLabel}
                descriptionPlaceholder={lane.descriptionPlaceholder}
                serviceLabel={lane.serviceLabel}
                serviceHelpText={lane.serviceHelpText}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <CardEyebrow>Service status</CardEyebrow>
                <CardTitle className="text-white">
                  Live health across every service
                </CardTitle>
                <p className="text-muted-foreground text-sm leading-7">
                  Check what is healthy, what looks degraded, and which services
                  still need monitoring before you open a request.
                </p>
              </div>

              <div className="space-y-3">
                {servicesWithStatus.length ? (
                  servicesWithStatus.map((service) => (
                    <div
                      key={service.id}
                      className="border-border bg-muted/45 rounded-[18px] border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">
                              {service.name}
                            </p>
                            <Badge tone={statusTone(service.healthStatus)}>
                              {service.healthLabel}
                            </Badge>
                            <Badge tone="neutral">/{service.slug}</Badge>
                            <Badge
                              tone={service.isActive ? "accent" : "warning"}
                            >
                              {service.isActive
                                ? "monitor connected"
                                : "monitor inactive"}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground text-sm leading-7">
                            {service.description}
                          </p>

                          <p className="text-muted-foreground text-sm leading-6">
                            {service.summary}
                          </p>
                        </div>

                        <Button asChild variant="secondary" size="sm">
                          <Link
                            href={
                              `/app/${application.slug}/services/${service.slug}` as Route
                            }
                          >
                            Open service
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="border-border/70 mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
                        <div className="text-muted-foreground flex flex-wrap gap-4">
                          <span>
                            {service.monitorCount
                              ? `${service.monitorCount} monitor${service.monitorCount === 1 ? "" : "s"}`
                              : "No public monitor data yet"}
                          </span>

                          {service.uptimeRatio24h !== null ? (
                            <span>
                              24h uptime{" "}
                              {(service.uptimeRatio24h * 100).toFixed(2)}%
                            </span>
                          ) : null}

                          {service.averageLatencyMs !== null ? (
                            <span>
                              Avg latency {Math.round(service.averageLatencyMs)}{" "}
                              ms
                            </span>
                          ) : null}

                          {service.checkedAt ? (
                            <span>Checked {formatDate(service.checkedAt)}</span>
                          ) : null}
                        </div>

                        {service.statusPageUrl ? (
                          <a
                            href={service.statusPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent inline-flex items-center gap-2 font-semibold tracking-[0.14em] uppercase"
                          >
                            Open monitor
                            <ExternalLink className="size-3.5" />
                          </a>
                        ) : null}
                      </div>
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
        </div>
      </div>
    </div>
  );
}
