import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  parseTicketFilters,
  ticketInputSchema,
} from "@/features/tickets/schemas/ticketSchemas";
import {
  createTicket,
  listTickets,
} from "@/features/tickets/server/ticketService";
import { getApplicationById } from "@/features/applications/server/applicationService";
import { getServiceById } from "@/features/services/server/serviceService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

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
  return NextResponse.json(tickets);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  const body = await request.json();
  const parsed = ticketInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid ticket payload",
      400,
    );
  }

  const application = await getApplicationById(parsed.data.appId);

  if (!application) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  if (parsed.data.serviceId) {
    const service = await getServiceById(parsed.data.serviceId);

    if (!service || service.applicationId !== application.id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Selected service does not belong to this application",
        400,
      );
    }
  }

  const ticket = await createTicket(parsed.data, session.user.id);
  revalidateTag("tickets", "max");
  revalidateTag(`application-${application.slug}`, "max");

  return NextResponse.json(ticket, { status: 201 });
}
