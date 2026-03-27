import { eq, notInArray } from "drizzle-orm";
import { db, sql } from "@/db";
import { applications, services, tickets, users } from "@/db/schema";
import {
  seedApplications,
  seedServices,
  seedTickets,
  seedUsers,
} from "@/db/seeds/data";

type SeedAnalysisState = "not_requested" | "pending" | "completed" | "failed";

async function main() {
  for (const user of seedUsers) {
    await db
      .insert(users)
      .values({
        ...user,
        emailVerified: true,
        avatarUrl: null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.name,
          email: user.email,
          role: user.role,
          gitlabUserId: user.gitlabUserId,
          updatedAt: new Date(),
        },
      });
  }

  const insertedApplications = [] as Array<{ id: string; slug: string }>;

  for (const application of seedApplications) {
    const [record] = await db
      .insert(applications)
      .values(application)
      .onConflictDoUpdate({
        target: applications.slug,
        set: {
          name: application.name,
          description: application.description,
          updatedAt: new Date(),
        },
      })
      .returning({ id: applications.id, slug: applications.slug });

    insertedApplications.push(record);
  }

  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@example.com"));
  const [standardUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "morgan@example.com"));

  if (!adminUser || !standardUser) {
    throw new Error("Seed users were not created correctly");
  }

  await db.delete(tickets);
  await db.delete(services);
  await db.delete(applications).where(
    notInArray(
      applications.slug,
      seedApplications.map(({ slug }) => slug),
    ),
  );

  const applicationIdBySlug = new Map(
    insertedApplications.map((application) => [
      application.slug,
      application.id,
    ]),
  );

  const insertedServices = [] as Array<{
    id: string;
    applicationId: string;
    slug: string;
  }>;

  for (const service of seedServices) {
    const applicationId = applicationIdBySlug.get(service.applicationSlug);

    if (!applicationId) {
      throw new Error(
        `Seed application not found for ${service.applicationSlug}`,
      );
    }

    const [record] = await db
      .insert(services)
      .values({
        applicationId,
        name: service.name,
        slug: service.slug,
        description: service.description,
        uptimeKumaIdentifier: service.uptimeKumaIdentifier,
      })
      .returning({
        id: services.id,
        applicationId: services.applicationId,
        slug: services.slug,
      });

    insertedServices.push(record);
  }

  const serviceIdByKey = new Map(
    insertedServices.map((service) => [
      `${service.applicationId}:${service.slug}`,
      service.id,
    ]),
  );

  await db.insert(tickets).values(
    seedTickets.map((ticket, index) => {
      const applicationId = applicationIdBySlug.get(ticket.applicationSlug);

      if (!applicationId) {
        throw new Error(
          `Ticket application not found for ${ticket.applicationSlug}`,
        );
      }

      const serviceId = serviceIdByKey.get(
        `${applicationId}:${ticket.serviceSlug}`,
      );
      const analysisState: SeedAnalysisState =
        index === 1 ? "pending" : index === 2 ? "completed" : "not_requested";

      return {
        appId: applicationId,
        serviceId: serviceId ?? null,
        type: ticket.type,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        submittedByUserId: index === 1 ? adminUser.id : standardUser.id,
        analysisState,
      };
    }),
  );

  await sql.end();
}

main().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
