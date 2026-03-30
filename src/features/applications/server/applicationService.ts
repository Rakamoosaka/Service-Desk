import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { syncApplicationServices } from "@/features/applications/server/applicationSyncService";
import type { ApplicationInput } from "@/features/applications/schemas/applicationSchemas";
import { getApplicationUptimeByIdentifierOrThrow } from "@/features/uptime/server/uptimeService";

export async function listApplications() {
  return db.query.applications.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      uptimeKumaIdentifier: true,
      lastSyncedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [asc(applications.name)],
  });
}

export async function listApplicationsCached() {
  return listApplications();
}

export async function listApplicationsWithServices() {
  return db.query.applications.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      uptimeKumaIdentifier: true,
      lastSyncedAt: true,
    },
    with: {
      services: {
        orderBy: (service, helpers) => [helpers.asc(service.name)],
        columns: {
          id: true,
          name: true,
          slug: true,
          description: true,
          kumaMonitorId: true,
          kumaMonitorName: true,
          isActive: true,
          lastSyncedAt: true,
        },
      },
    },
    orderBy: [asc(applications.name)],
  });
}

export async function listApplicationsWithServicesCached() {
  return listApplicationsWithServices();
}

export async function getApplicationById(id: string) {
  const [application] = await db.query.applications.findMany({
    where: eq(applications.id, id),
  });

  return application ?? null;
}

export async function getApplicationBySlug(slug: string) {
  const [application] = await db.query.applications.findMany({
    where: eq(applications.slug, slug),
    with: {
      services: {
        orderBy: (service, helpers) => [helpers.asc(service.name)],
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
      },
      tickets: {
        orderBy: (ticket, helpers) => [helpers.desc(ticket.createdAt)],
        columns: {
          id: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          suspectedDuplicateTicketId: true,
          createdAt: true,
        },
        with: {
          service: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return application ?? null;
}

export async function getApplicationBySlugCached(slug: string) {
  return getApplicationBySlug(slug);
}

export async function createApplication(input: ApplicationInput) {
  const snapshot = await getApplicationUptimeByIdentifierOrThrow(
    input.uptimeKumaIdentifier,
  );

  const [application] = await db
    .insert(applications)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description,
      uptimeKumaIdentifier: input.uptimeKumaIdentifier,
    })
    .returning();

  await syncApplicationServices(application.id, snapshot);

  return application;
}

export async function updateApplication(id: string, input: ApplicationInput) {
  const snapshot = await getApplicationUptimeByIdentifierOrThrow(
    input.uptimeKumaIdentifier,
  );

  const [application] = await db
    .update(applications)
    .set({
      name: input.name,
      slug: input.slug,
      description: input.description,
      uptimeKumaIdentifier: input.uptimeKumaIdentifier,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id))
    .returning();

  if (application) {
    await syncApplicationServices(application.id, snapshot);
  }

  return application ?? null;
}

export async function deleteApplication(id: string) {
  const [application] = await db
    .delete(applications)
    .where(eq(applications.id, id))
    .returning({
      id: applications.id,
      slug: applications.slug,
    });

  return application ?? null;
}

export async function listRecentApplications() {
  return db.query.applications.findMany({
    orderBy: [desc(applications.createdAt)],
    limit: 5,
  });
}
