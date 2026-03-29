import { notFound } from "next/navigation";
import { ApplicationStatusExperience } from "@/app/(protected)/app/[slug]/_components/ApplicationStatusExperience";
import { getApplicationBySlugCached } from "@/features/applications/server/applicationService";
import {
  buildServiceUptimeSnapshot,
  getApplicationUptime,
} from "@/features/uptime/server/uptimeService";
import type { UptimeState } from "@/features/uptime/server/uptimeTypes";
import { requireUser } from "@/lib/auth/session";

interface ApplicationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function normalizeStatus(status: UptimeState) {
  return status === "stale" ? "unknown" : status;
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

  const servicesWithStatus = await Promise.all(
    application.services.map(async (service) => {
      const snapshot = buildServiceUptimeSnapshot(
        applicationSnapshot,
        service.kumaMonitorId,
        service.name,
      );
      const healthStatus = normalizeStatus(snapshot.status);

      return {
        id: service.id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        isActive: service.isActive,
        applicationSlug: application.slug,
        healthStatus,
        healthLabel: statusLabel(healthStatus),
        checkedAt: snapshot.monitors.length ? snapshot.checkedAt : null,
        statusPageUrl: snapshot.statusPageUrl,
        initialSnapshot: snapshot,
      };
    }),
  );

  const counts = servicesWithStatus.reduce(
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
    servicesWithStatus.map((service) => service.healthStatus),
  );

  return (
    <ApplicationStatusExperience
      application={{
        id: application.id,
        name: application.name,
        slug: application.slug,
        description: application.description,
        overallStatus,
        overallLabel: statusLabel(overallStatus),
        counts,
        services: servicesWithStatus,
      }}
    />
  );
}
