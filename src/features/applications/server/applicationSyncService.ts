import { eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, services } from "@/db/schema";
import type { UptimeSnapshot } from "@/features/uptime/server/uptimeTypes";
import { slugify } from "@/lib/utils";

function createImportedDescription(monitorName: string) {
  return `Imported from the Uptime Kuma monitor \"${monitorName}\".`;
}

function createUniqueSlug(name: string, usedSlugs: Set<string>) {
  const baseSlug = slugify(name) || "monitor";
  let candidate = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(candidate);
  return candidate;
}

export async function syncApplicationServices(
  applicationId: string,
  snapshot: UptimeSnapshot,
) {
  const existingServices = await db.query.services.findMany({
    where: eq(services.applicationId, applicationId),
    columns: {
      id: true,
      applicationId: true,
      name: true,
      slug: true,
      description: true,
      kumaMonitorId: true,
      kumaMonitorName: true,
      isActive: true,
      lastSyncedAt: true,
    },
    orderBy: (service, helpers) => [helpers.asc(service.name)],
  });

  const now = new Date();
  const usedSlugs = new Set(existingServices.map((service) => service.slug));
  const matchedServiceIds = new Set<string>();

  for (const monitor of snapshot.monitors) {
    const generatedSlug = slugify(monitor.name) || "monitor";
    const existingService =
      existingServices.find(
        (service) => service.kumaMonitorId === monitor.id,
      ) ??
      existingServices.find(
        (service) =>
          service.kumaMonitorId === null &&
          (service.slug === generatedSlug || service.name === monitor.name),
      );

    if (existingService) {
      matchedServiceIds.add(existingService.id);

      await db
        .update(services)
        .set({
          kumaMonitorId: monitor.id,
          kumaMonitorName: monitor.name,
          isActive: true,
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(services.id, existingService.id));

      continue;
    }

    const slug = createUniqueSlug(monitor.name, usedSlugs);
    const [createdService] = await db
      .insert(services)
      .values({
        applicationId,
        name: monitor.name,
        slug,
        description: createImportedDescription(monitor.name),
        kumaMonitorId: monitor.id,
        kumaMonitorName: monitor.name,
        isActive: true,
        lastSyncedAt: now,
      })
      .returning({ id: services.id });

    matchedServiceIds.add(createdService.id);
  }

  for (const service of existingServices) {
    if (matchedServiceIds.has(service.id)) {
      continue;
    }

    await db
      .update(services)
      .set({
        isActive: false,
        lastSyncedAt: now,
        updatedAt: now,
      })
      .where(eq(services.id, service.id));
  }

  await db
    .update(applications)
    .set({
      lastSyncedAt: now,
      updatedAt: now,
    })
    .where(eq(applications.id, applicationId));
}
