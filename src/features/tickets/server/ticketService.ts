import { and, count, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, tickets, users } from "@/db/schema";
import type {
  StoredTicketAiTriage,
  TicketAiSuggestionStatus,
} from "@/features/tickets/ticketAi";
import type {
  BulkTicketUpdateInput,
  TicketFilters,
  TicketInput,
} from "@/features/tickets/schemas/ticketSchemas";

type TicketStatus = "new" | "in_review" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical" | "unknown";
type TicketAiReviewAction =
  | "accept"
  | "dismiss"
  | "accept_type"
  | "dismiss_type"
  | "clear_duplicate"
  | "clear_all_duplicates";

function removeLaneRecommendation(aiTriage: StoredTicketAiTriage) {
  const rest = { ...aiTriage };

  delete rest.recommendedType;
  delete rest.recommendedTypeConfidence;
  delete rest.typeReason;

  return rest;
}

function resolveTicketAiSuggestionStatus(
  recommendedType: StoredTicketAiTriage["recommendedType"],
  nextType: string,
  nextDuplicateTicketId: string | null,
): TicketAiSuggestionStatus {
  const hasPendingTypeSuggestion = Boolean(
    recommendedType && recommendedType !== nextType,
  );
  const hasPendingDuplicateSuggestion = Boolean(nextDuplicateTicketId);

  if (hasPendingTypeSuggestion || hasPendingDuplicateSuggestion) {
    return "pending_review";
  }

  if (recommendedType && nextType === recommendedType) {
    return "accepted";
  }

  return "dismissed";
}

async function attachDuplicateCandidates<
  TTicket extends {
    suspectedDuplicateTicketId: string | null;
  },
>(ticketRows: TTicket[]) {
  const candidateIds = Array.from(
    new Set(
      ticketRows
        .map((ticket) => ticket.suspectedDuplicateTicketId)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  if (!candidateIds.length) {
    return ticketRows.map((ticket) => ({
      ...ticket,
      suspectedDuplicateTicket: null,
    }));
  }

  const duplicateCandidates = await db.query.tickets.findMany({
    where: inArray(tickets.id, candidateIds),
    columns: {
      id: true,
      title: true,
      type: true,
      status: true,
      priority: true,
      createdAt: true,
    },
  });

  const candidateById = new Map(
    duplicateCandidates.map((ticket) => [ticket.id, ticket]),
  );

  return ticketRows.map((ticket) => ({
    ...ticket,
    suspectedDuplicateTicket: ticket.suspectedDuplicateTicketId
      ? (candidateById.get(ticket.suspectedDuplicateTicketId) ?? null)
      : null,
  }));
}

export async function createTicket(
  input: TicketInput,
  submittedByUserId: string,
) {
  const [ticket] = await db
    .insert(tickets)
    .values({
      appId: input.appId,
      serviceId: input.serviceId || null,
      type: input.type,
      title: input.title,
      description: input.description,
      submittedByUserId,
      analysisState: "not_requested",
      aiSuggestionStatus: "none",
      aiTriage: {},
      suspectedDuplicateTicketId: null,
      priority: "unknown",
      status: "new",
    })
    .returning();

  return ticket;
}

function normalizeSearchTerm(search: TicketFilters["search"]) {
  const value = search?.trim();
  return value ? value : undefined;
}

function buildBaseTicketPredicates(filters: TicketFilters) {
  return [
    filters.appId ? eq(tickets.appId, filters.appId) : undefined,
    filters.status ? eq(tickets.status, filters.status) : undefined,
    filters.type ? eq(tickets.type, filters.type) : undefined,
  ].filter(Boolean);
}

function buildFullTextQuery(search: string) {
  return sql`websearch_to_tsquery('english', ${search})`;
}

function buildTicketSearchPredicate(search: string) {
  const searchQuery = buildFullTextQuery(search);
  const searchPattern = `%${search}%`;

  return or(
    sql`${tickets.searchVector} @@ ${searchQuery}`,
    ilike(tickets.title, searchPattern),
    ilike(tickets.description, searchPattern),
  );
}

function buildTicketSearchRank(search: string) {
  const searchQuery = buildFullTextQuery(search);

  return sql<number>`ts_rank_cd(${tickets.searchVector}, ${searchQuery})`;
}

async function fetchTicketRowsByIds(ticketIds: string[]) {
  const ticketRows = await db.query.tickets.findMany({
    where: inArray(tickets.id, ticketIds),
    columns: {
      id: true,
      appId: true,
      serviceId: true,
      type: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      aiSuggestionStatus: true,
      aiTriage: true,
      suspectedDuplicateTicketId: true,
      analysisState: true,
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
      service: {
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

  const ticketById = new Map(ticketRows.map((ticket) => [ticket.id, ticket]));

  return ticketIds.flatMap((ticketId) => {
    const ticket = ticketById.get(ticketId);
    return ticket ? [ticket] : [];
  });
}

export async function listTickets(filters: TicketFilters = {}) {
  const normalizedSearch = normalizeSearchTerm(filters.search);
  const predicates = buildBaseTicketPredicates(filters);

  if (!normalizedSearch) {
    const ticketRows = await db.query.tickets.findMany({
      where: predicates.length ? and(...predicates) : undefined,
      orderBy: [desc(tickets.createdAt)],
      columns: {
        id: true,
        appId: true,
        serviceId: true,
        type: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        aiSuggestionStatus: true,
        aiTriage: true,
        suspectedDuplicateTicketId: true,
        analysisState: true,
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
        service: {
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

    return attachDuplicateCandidates(ticketRows);
  }

  const searchPredicate = buildTicketSearchPredicate(normalizedSearch);
  const searchRank = buildTicketSearchRank(normalizedSearch);
  const rankedTicketIds = await db
    .select({
      id: tickets.id,
      rank: searchRank,
    })
    .from(tickets)
    .where(and(...[...predicates, searchPredicate].filter(Boolean)))
    .orderBy(desc(searchRank), desc(tickets.createdAt));

  if (!rankedTicketIds.length) {
    return [];
  }

  const ticketRows = await fetchTicketRowsByIds(
    rankedTicketIds.map((ticket) => ticket.id),
  );

  return attachDuplicateCandidates(ticketRows);
}

export async function listTicketsCached(filters: TicketFilters = {}) {
  return listTickets(filters);
}

export async function listTicketsByApplication(appId: string) {
  return db.query.tickets.findMany({
    where: eq(tickets.appId, appId),
    orderBy: [desc(tickets.createdAt)],
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
      submittedBy: {
        columns: {
          name: true,
        },
      },
    },
  });
}

export async function getTicketById(id: string) {
  const [ticket] = await db.query.tickets.findMany({
    where: eq(tickets.id, id),
    columns: {
      id: true,
      appId: true,
      serviceId: true,
      type: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      aiSuggestionStatus: true,
      aiTriage: true,
      suspectedDuplicateTicketId: true,
      analysisState: true,
      submittedByUserId: true,
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
      service: {
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

  if (!ticket) {
    return null;
  }

  const [ticketWithDuplicate] = await attachDuplicateCandidates([ticket]);
  return ticketWithDuplicate ?? null;
}

export async function listTicketDuplicateCandidates(ticketId: string) {
  const currentTicket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    columns: {
      id: true,
      appId: true,
      serviceId: true,
      type: true,
      title: true,
      description: true,
      createdAt: true,
    },
  });

  if (!currentTicket) {
    return [];
  }

  return db.query.tickets.findMany({
    where: and(
      eq(tickets.appId, currentTicket.appId),
      ne(tickets.id, ticketId),
    ),
    columns: {
      id: true,
      serviceId: true,
      type: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
    },
    orderBy: [desc(tickets.createdAt)],
    limit: 24,
  });
}

export async function updateTicketAutomation(
  id: string,
  input: {
    priority: TicketPriority;
    aiTriage: StoredTicketAiTriage;
    suspectedDuplicateTicketId: string | null;
    aiSuggestionStatus: TicketAiSuggestionStatus;
    analysisState: "completed" | "failed" | "not_requested";
  },
) {
  const [ticket] = await db
    .update(tickets)
    .set({
      priority: input.priority,
      aiTriage: input.aiTriage,
      suspectedDuplicateTicketId: input.suspectedDuplicateTicketId,
      aiSuggestionStatus: input.aiSuggestionStatus,
      analysisState: input.analysisState,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();

  return ticket ?? null;
}

export async function setTicketAnalysisState(
  id: string,
  analysisState: "not_requested" | "pending" | "completed" | "failed",
) {
  const [ticket] = await db
    .update(tickets)
    .set({
      analysisState,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();

  return ticket ?? null;
}

export async function reviewTicketAiSuggestions(
  id: string,
  action: TicketAiReviewAction,
) {
  const ticket = await getTicketById(id);

  if (!ticket) {
    return null;
  }

  const recommendedType = ticket.aiTriage?.recommendedType;

  if (action === "accept" || action === "dismiss") {
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        type:
          action === "accept" && recommendedType
            ? recommendedType
            : ticket.type,
        suspectedDuplicateTicketId:
          action === "dismiss" ? null : ticket.suspectedDuplicateTicketId,
        aiSuggestionStatus: action === "accept" ? "accepted" : "dismissed",
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();

    return updatedTicket ?? null;
  }

  const nextType =
    action === "accept_type" && recommendedType ? recommendedType : ticket.type;
  const nextDuplicateTicketId =
    action === "clear_duplicate" || action === "clear_all_duplicates"
      ? null
      : ticket.suspectedDuplicateTicketId;
  const nextAiTriage =
    action === "dismiss_type"
      ? removeLaneRecommendation(ticket.aiTriage)
      : ticket.aiTriage;
  const nextSuggestionStatus = resolveTicketAiSuggestionStatus(
    nextAiTriage.recommendedType,
    nextType,
    nextDuplicateTicketId,
  );

  const [updatedTicket] = await db
    .update(tickets)
    .set({
      type: nextType,
      aiTriage: nextAiTriage,
      suspectedDuplicateTicketId: nextDuplicateTicketId,
      aiSuggestionStatus: nextSuggestionStatus,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();

  return updatedTicket ?? null;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
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

export async function updateTicketPriority(
  id: string,
  priority: TicketPriority,
) {
  const [ticket] = await db
    .update(tickets)
    .set({
      priority,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();

  return ticket ?? null;
}

export async function bulkUpdateTickets(input: BulkTicketUpdateInput) {
  const [field, value] = input.status
    ? (["status", input.status] as const)
    : (["priority", input.priority] as const);

  return db
    .update(tickets)
    .set({
      [field]: value,
      updatedAt: new Date(),
    })
    .where(inArray(tickets.id, input.ids))
    .returning({
      id: tickets.id,
      appId: tickets.appId,
      status: tickets.status,
      priority: tickets.priority,
    });
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
