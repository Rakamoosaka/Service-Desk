import { eq } from "drizzle-orm";
import { db, sql } from "@/db";
import { applications, tickets, users } from "@/db/schema";
import { seedApplications, seedTickets, seedUsers } from "@/db/seeds/data";

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
          uptimeKumaIdentifier: application.uptimeKumaIdentifier,
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

  await db.insert(tickets).values([
    {
      ...seedTickets[0],
      appId: insertedApplications[0].id,
      submittedByUserId: standardUser.id,
      analysisState: "not_requested",
    },
    {
      ...seedTickets[1],
      appId: insertedApplications[1].id,
      submittedByUserId: adminUser.id,
      analysisState: "pending",
    },
    {
      ...seedTickets[2],
      appId: insertedApplications[2].id,
      submittedByUserId: standardUser.id,
      analysisState: "completed",
    },
  ]);

  await sql.end();
}

main().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
