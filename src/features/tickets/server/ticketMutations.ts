import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import type {
  StoredTicketAiTriage,
  TicketAiSuggestionStatus,
} from "@/features/tickets/ticketAi";
import type {
  BulkTicketUpdateInput,
  TicketInput,
} from "@/features/tickets/schemas/ticketSchemas";
import { getTicketById } from "@/features/tickets/server/ticketQueries";

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
