import type {
  ApplicationRecord,
  ServiceRecord,
} from "@/features/applications/components/applicationsManager.types";

export function formatTimestamp(value: string | Date | null) {
  if (!value) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value instanceof Date ? value : new Date(value));
}

export function getServiceSummary(services: ServiceRecord[]) {
  const activeCount = services.filter((service) => service.isActive).length;

  return {
    totalCount: services.length,
    activeCount,
    inactiveCount: services.length - activeCount,
  };
}

export function countApplicationServices(applications: ApplicationRecord[]) {
  return applications.reduce(
    (count, application) => count + application.services.length,
    0,
  );
}

export function countInactiveApplicationServices(
  applications: ApplicationRecord[],
) {
  return applications.reduce(
    (count, application) =>
      count +
      application.services.filter((service) => !service.isActive).length,
    0,
  );
}
