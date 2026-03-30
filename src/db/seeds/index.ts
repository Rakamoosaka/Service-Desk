import { eq } from "drizzle-orm";
import { db, sql } from "@/db";
import { applications, services, tickets, users } from "@/db/schema";
import { createApplication } from "@/features/applications/server/applicationService";
import type { StoredTicketAiTriage } from "@/features/tickets/ticketAi";
import { seedApplications, seedTickets, seedUsers } from "@/db/seeds/data";

type SeedAnalysisState = "not_requested" | "pending" | "completed" | "failed";

function buildPriorityReason(priority: "low" | "medium" | "high" | "critical") {
  switch (priority) {
    case "critical":
      return "This issue blocks core access or a critical workflow and needs immediate attention.";
    case "high":
      return "This problem meaningfully disrupts work for multiple users and should be triaged quickly.";
    case "medium":
      return "This affects a real workflow, but teams still have a workaround or partial path forward.";
    default:
      return "This is low-impact feedback or an incremental improvement request rather than an urgent blocker.";
  }
}

function buildBaseAiTriage(
  ticket: (typeof seedTickets)[number],
  priority: "low" | "medium" | "high" | "critical",
): StoredTicketAiTriage {
  return {
    recommendedType: ticket.type,
    recommendedTypeConfidence: 84,
    typeReason: `The ticket language most closely matches the current ${ticket.type} lane.`,
    priorityReason: buildPriorityReason(priority),
    sentiment:
      ticket.type === "bug"
        ? "negative"
        : ticket.type === "suggestion"
          ? "neutral"
          : "neutral",
    technicalImpact:
      priority === "critical"
        ? "critical"
        : priority === "high"
          ? "high"
          : priority === "medium"
            ? "medium"
            : "low",
    duplicateReason: null,
    duplicateScore: null,
    duplicateSignals: [],
  };
}

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

  if (!seedApplications.length) {
    await sql.end();
    return;
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
  await db.delete(applications);

  const insertedApplications = [] as Array<{ id: string; slug: string }>;

  for (const application of seedApplications) {
    const createdApplication = await createApplication(application);

    insertedApplications.push({
      id: createdApplication.id,
      slug: createdApplication.slug,
    });
  }

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

  for (const application of insertedApplications) {
    const syncedServices = await db.query.services.findMany({
      where: eq(services.applicationId, application.id),
      columns: {
        id: true,
        applicationId: true,
        slug: true,
      },
      orderBy: (service, helpers) => [helpers.asc(service.name)],
    });

    if (syncedServices.length !== 2) {
      throw new Error(
        `Expected exactly 2 imported services for ${application.slug}, received ${syncedServices.length}`,
      );
    }

    insertedServices.push(...syncedServices);
  }

  const serviceIdByKey = new Map(
    insertedServices.map((service) => [
      `${service.applicationId}:${service.slug}`,
      service.id,
    ]),
  );

  const insertedTickets = await db
    .insert(tickets)
    .values(
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

        return {
          appId: applicationId,
          serviceId: serviceId ?? null,
          type: ticket.type,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          submittedByUserId: index % 4 === 0 ? adminUser.id : standardUser.id,
          analysisState: "not_requested" as SeedAnalysisState,
        };
      }),
    )
    .returning({ id: tickets.id });

  const aiOverrides = new Map([
    [
      0,
      {
        priority: "critical" as const,
        aiSuggestionStatus: "pending_review" as const,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 98,
          typeReason:
            "The ticket describes a real availability mismatch where the public status still looks healthy while the underlying service is timing out, so it belongs in the bug lane rather than feedback.",
          priorityReason:
            "The public signal is misleading responders while the service appears unavailable to real users, which makes this a critical incident.",
          sentiment: "negative" as const,
          technicalImpact: "critical" as const,
          duplicateReason: null,
          duplicateScore: null,
          duplicateSignals: [],
        },
      },
    ],
    [
      1,
      {
        priority: "critical" as const,
        aiSuggestionStatus: "pending_review" as const,
        duplicateOfIndex: 0,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 97,
          typeReason:
            "This report is describing the same false-green outage condition on Test Monitor 1 and belongs in the bug lane.",
          priorityReason:
            "A monitor showing healthy during active timeouts creates a critical operational blind spot.",
          sentiment: "negative" as const,
          technicalImpact: "critical" as const,
          duplicateReason:
            "Both tickets describe Test Monitor 1 staying green while real traffic is timing out.",
          duplicateScore: 97,
          duplicateSignals: [
            "status page still green",
            "user requests timing out",
            "same monitor affected",
          ],
        },
      },
    ],
    [
      2,
      {
        priority: "medium" as const,
        aiSuggestionStatus: "pending_review" as const,
        aiTriage: {
          recommendedType: "suggestion" as const,
          recommendedTypeConfidence: 95,
          typeReason:
            "The ticket is asking for a planned-maintenance workflow for Test Monitor 2 rather than describing a production defect, so it fits the suggestion lane.",
          priorityReason:
            "This would reduce alert noise during scheduled work, but it does not block incident response today.",
          sentiment: "neutral" as const,
          technicalImpact: "medium" as const,
          duplicateReason: null,
          duplicateScore: null,
          duplicateSignals: [],
        },
      },
    ],
    [
      5,
      {
        priority: "medium" as const,
        aiSuggestionStatus: "pending_review" as const,
        duplicateOfIndex: 4,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 90,
          typeReason:
            "The report describes exported incident notes being truncated, which is a functional defect rather than general feedback.",
          priorityReason:
            "The export still completes, but losing recovery details creates reporting and postmortem pain for responders.",
          sentiment: "negative" as const,
          technicalImpact: "medium" as const,
          duplicateReason:
            "Both tickets report Test Monitor 1 incident notes being cut off during export.",
          duplicateScore: 93,
          duplicateSignals: [
            "incident export",
            "note truncated",
            "timeline incomplete",
          ],
        },
      },
    ],
    [
      9,
      {
        priority: "high" as const,
        aiSuggestionStatus: "pending_review" as const,
        duplicateOfIndex: 8,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 96,
          typeReason:
            "The underlying issue is duplicate recovery delivery for Test Monitor 2, which is a bug even though the ticket was submitted as feedback.",
          priorityReason:
            "The alerting system is misfiring during real incidents and creating confusion, even though the monitor itself still recovers.",
          sentiment: "negative" as const,
          technicalImpact: "high" as const,
          duplicateReason:
            "Both tickets describe Test Monitor 2 sending duplicate recovery notices to the same recipients.",
          duplicateScore: 95,
          duplicateSignals: [
            "duplicate recovery alerts",
            "same recipients",
            "Test Monitor 2",
          ],
        },
      },
    ],
    [
      10,
      {
        priority: "medium" as const,
        aiSuggestionStatus: "pending_review" as const,
        aiTriage: {
          recommendedType: "suggestion" as const,
          recommendedTypeConfidence: 94,
          typeReason:
            "This asks for a maintenance-window mute capability, which is a product improvement request and belongs in the suggestion lane.",
          priorityReason:
            "The current system is noisy during maintenance, but teams can still operate with a manual workaround.",
          sentiment: "neutral" as const,
          technicalImpact: "medium" as const,
          duplicateReason: null,
          duplicateScore: null,
          duplicateSignals: [],
        },
      },
    ],
    [
      12,
      {
        priority: "medium" as const,
        aiSuggestionStatus: "pending_review" as const,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 97,
          typeReason:
            "The incident note modal is dropping user-entered content unexpectedly, which is a product bug rather than general feedback.",
          priorityReason:
            "Users can retry the update, but losing a drafted incident note creates rework during response.",
          sentiment: "negative" as const,
          technicalImpact: "medium" as const,
          duplicateReason: null,
          duplicateScore: null,
          duplicateSignals: [],
        },
      },
    ],
    [
      13,
      {
        priority: "medium" as const,
        aiSuggestionStatus: "pending_review" as const,
        duplicateOfIndex: 12,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 98,
          typeReason:
            "This is the same destructive incident-note modal dismissal and belongs in the bug lane.",
          priorityReason:
            "The issue causes user rework and lost incident context, but the update can still be re-entered manually.",
          sentiment: "negative" as const,
          technicalImpact: "medium" as const,
          duplicateReason:
            "Both tickets describe the Test Monitor 2 note dialog closing on escape and wiping unsaved text.",
          duplicateScore: 96,
          duplicateSignals: ["escape key", "draft lost", "incident note modal"],
        },
      },
    ],
    [
      15,
      {
        priority: "low" as const,
        aiSuggestionStatus: "pending_review" as const,
        aiTriage: {
          recommendedType: "suggestion" as const,
          recommendedTypeConfidence: 92,
          typeReason:
            "The ticket asks for a queue search improvement and does not describe broken behavior, so it fits the suggestion lane.",
          priorityReason:
            "This improves incident review efficiency but is not urgent or blocking.",
          sentiment: "neutral" as const,
          technicalImpact: "low" as const,
          duplicateReason: null,
          duplicateScore: null,
          duplicateSignals: [],
        },
      },
    ],
    [
      17,
      {
        priority: "high" as const,
        aiSuggestionStatus: "pending_review" as const,
        duplicateOfIndex: 16,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 95,
          typeReason:
            "The ticket is describing the same rapid state-reversion defect on Test Monitor 1, so the current bug lane is correct.",
          priorityReason:
            "The queue can become inaccurate during active incident response, which is a high-impact operational problem.",
          sentiment: "negative" as const,
          technicalImpact: "high" as const,
          duplicateReason:
            "Both tickets describe rapid Test Monitor 1 state changes causing the incident to revert unexpectedly.",
          duplicateScore: 94,
          duplicateSignals: [
            "rapid state changes",
            "reverts to investigating",
            "same monitor affected",
          ],
        },
      },
    ],
    [
      18,
      {
        priority: "high" as const,
        aiSuggestionStatus: "pending_review" as const,
        aiTriage: {
          recommendedType: "bug" as const,
          recommendedTypeConfidence: 93,
          typeReason:
            "The ticket describes a blank application page caused by an upstream failure condition, which is a bug rather than general feedback.",
          priorityReason:
            "Users perceive the product as unavailable when the fallback state fails to render.",
          sentiment: "negative" as const,
          technicalImpact: "high" as const,
          duplicateReason: null,
          duplicateScore: null,
          duplicateSignals: [],
        },
      },
    ],
  ]);

  for (const [index, insertedTicket] of insertedTickets.entries()) {
    const ticket = seedTickets[index];
    const override = aiOverrides.get(index);
    const priority = override?.priority ?? ticket.priority;

    await db
      .update(tickets)
      .set({
        priority,
        aiSuggestionStatus: override?.aiSuggestionStatus ?? "none",
        aiTriage: override?.aiTriage ?? buildBaseAiTriage(ticket, priority),
        suspectedDuplicateTicketId:
          override &&
          "duplicateOfIndex" in override &&
          override.duplicateOfIndex !== undefined
            ? (insertedTickets[override.duplicateOfIndex]?.id ?? null)
            : null,
        analysisState: "completed",
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, insertedTicket.id));
  }

  await sql.end();
}

main().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
