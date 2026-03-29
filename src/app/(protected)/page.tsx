import { HomePageExperience } from "@/app/(protected)/_components/HomePageExperience";
import { listApplicationsWithServicesCached } from "@/features/applications/server/applicationService";
import { getServiceUptime } from "@/features/uptime/server/uptimeService";
import type { UptimeState } from "@/features/uptime/server/uptimeTypes";
import { requireUser } from "@/lib/auth/session";

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
    <HomePageExperience
      session={session}
      applicationsWithStatus={applicationsWithStatus}
      totals={totals}
    />
  );
}
