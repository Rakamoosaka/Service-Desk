import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { applications, tickets, users } from "@/db/schema";
import type {
  TicketFilters,
  TicketInput,
} from "@/features/tickets/schemas/ticketSchemas";

export async function createTicket(
  input: TicketInput,
  submittedByUserId: string,
) {
  const [ticket] = await db
    .insert(tickets)
    .values({
      appId: input.appId,
      type: input.type,
      title: input.title,
      description: input.description,
      submittedByUserId,
      analysisState: "not_requested",
      priority: "unknown",
      status: "new",
    })
    .returning();

  return ticket;
}

export async function listTickets(filters: TicketFilters = {}) {
  const predicates = [
    filters.status ? eq(tickets.status, filters.status) : undefined,
    filters.type ? eq(tickets.type, filters.type) : undefined,
    filters.search
      ? or(
          ilike(tickets.title, `%${filters.search}%`),
          ilike(tickets.description, `%${filters.search}%`),
        )
      : undefined,
  ].filter(Boolean);

  return db.query.tickets.findMany({
    where: predicates.length ? and(...predicates) : undefined,
    orderBy: [desc(tickets.createdAt)],
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      submittedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function listTicketsCached(filters: TicketFilters = {}) {
  return listTickets(filters);
}

export async function listTicketsByApplication(appId: string) {
  return db.query.tickets.findMany({
    where: eq(tickets.appId, appId),
    orderBy: [desc(tickets.createdAt)],
    with: {
      submittedBy: {
        columns: {
          name: true,
        },
      },
    },
  });
}

export async function updateTicketStatus(
  id: string,
  status: "new" | "in_review" | "resolved" | "closed",
) {
  const [ticket] = await db
    .update(tickets)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();

  return ticket ?? null;
}

export async function getDashboardMetrics() {
  const [[ticketTotals], [applicationTotals], [userTotals]] = await Promise.all(
    [
      db.select({ value: count() }).from(tickets),
      db.select({ value: count() }).from(applications),
      db.select({ value: count() }).from(users),
    ],
  );

  const distribution = await db
    .select({
      status: tickets.status,
      value: count(),
    })
    .from(tickets)
    .groupBy(tickets.status)
    .orderBy(tickets.status);

  return {
    ticketCount: ticketTotals?.value ?? 0,
    applicationCount: applicationTotals?.value ?? 0,
    userCount: userTotals?.value ?? 0,
    distribution,
  };
}
