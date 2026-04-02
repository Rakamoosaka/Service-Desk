import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";

const fullTicketColumns = {
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
} as const;

const ticketWithRelations = {
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
} as const;

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

async function fetchTicketRowsByIds(ticketIds: string[]) {
  const ticketRows = await db.query.tickets.findMany({
    where: inArray(tickets.id, ticketIds),
    columns: fullTicketColumns,
    with: ticketWithRelations,
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
      columns: fullTicketColumns,
      with: ticketWithRelations,
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
      ...fullTicketColumns,
      submittedByUserId: true,
    },
    with: ticketWithRelations,
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
