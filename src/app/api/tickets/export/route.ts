import { NextRequest, NextResponse } from "next/server";
import { listTickets } from "@/features/tickets/server/ticketService";
import { parseTicketFilters } from "@/features/tickets/schemas/ticketSchemas";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

function escapeCsvValue(value: string) {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

function formatCsvDate(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  return value instanceof Date ? value.toISOString() : String(value);
}

function createTicketCsv(tickets: Awaited<ReturnType<typeof listTickets>>) {
  const headers = [
    "Title",
    "Description",
    "Type",
    "Status",
    "Priority",
    "AI Suggestion Status",
    "Suggested Type",
    "Likely Duplicate Ticket",
    "Application",
    "Service",
    "Submitted Email",
    "Submitted Role",
    "Created At",
    "Updated At",
  ];

  const rows = tickets.map((ticket) => [
    ticket.title,
    ticket.description,
    ticket.type,
    ticket.status,
    ticket.priority,
    ticket.aiSuggestionStatus,
    ticket.aiTriage?.recommendedType ?? "",
    ticket.suspectedDuplicateTicket?.title ?? "",
    ticket.application.name,
    ticket.service?.name ?? "",
    ticket.submittedBy.email,
    ticket.submittedBy.role,
    formatCsvDate(ticket.createdAt),
    formatCsvDate(ticket.updatedAt),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(String(value))).join(","))
    .join("\n");
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const filters = parseTicketFilters(request.nextUrl.searchParams);

  if (!filters.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid ticket filters", 400);
  }

  const tickets = await listTickets(filters.data);
  const csv = createTicketCsv(tickets);
  const timestamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="tickets-${timestamp}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
