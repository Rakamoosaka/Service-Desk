import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import type { ServiceMetadataInput } from "@/features/services/schemas/serviceSchemas";

export async function listServices() {
  return db.query.services.findMany({
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
      createdAt: true,
      updatedAt: true,
    },
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
          uptimeKumaIdentifier: true,
        },
      },
    },
    orderBy: [asc(services.name)],
  });
}

export async function listServicesCached() {
  return listServices();
}

export async function getServiceById(id: string) {
  const [service] = await db.query.services.findMany({
    where: eq(services.id, id),
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
          uptimeKumaIdentifier: true,
        },
      },
    },
  });

  return service ?? null;
}

export async function getServiceBySlugs(
  applicationSlug: string,
  serviceSlug: string,
) {
  const serviceMatches = await db.query.services.findMany({
    where: eq(services.slug, serviceSlug),
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
      createdAt: true,
      updatedAt: true,
    },
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
          uptimeKumaIdentifier: true,
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
      },
    },
  });

  return (
    serviceMatches.find(
      (service) => service.application.slug === applicationSlug,
    ) ?? null
  );
}

export async function updateServiceMetadata(
  id: string,
  input: ServiceMetadataInput,
) {
  const [service] = await db
    .update(services)
    .set({
      name: input.name,
      description: input.description,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id))
    .returning();

  return service ?? null;
}

export async function deleteService(id: string) {
  const [service] = await db
    .delete(services)
    .where(eq(services.id, id))
    .returning({
      id: services.id,
      slug: services.slug,
      applicationId: services.applicationId,
    });

  return service ?? null;
}

export async function listRecentServices() {
  return db.query.services.findMany({
    orderBy: [desc(services.createdAt)],
    limit: 5,
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}
