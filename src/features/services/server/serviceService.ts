import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import type { ServiceInput } from "@/features/services/schemas/serviceSchemas";

export async function listServices() {
  return db.query.services.findMany({
    columns: {
      id: true,
      applicationId: true,
      name: true,
      slug: true,
      description: true,
      uptimeKumaIdentifier: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
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
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
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

export async function createService(input: ServiceInput) {
  const [service] = await db
    .insert(services)
    .values({
      applicationId: input.applicationId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      uptimeKumaIdentifier: input.uptimeKumaIdentifier || null,
    })
    .returning();

  return service;
}

export async function updateService(id: string, input: ServiceInput) {
  const [service] = await db
    .update(services)
    .set({
      applicationId: input.applicationId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      uptimeKumaIdentifier: input.uptimeKumaIdentifier || null,
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
