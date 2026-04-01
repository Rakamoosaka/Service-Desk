import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getApplicationById } from "@/features/applications/server/applicationService";
import {
  ticketPrioritySchema,
  ticketStatusParamsSchema,
} from "@/features/tickets/schemas/ticketSchemas";
import { updateTicketPriority } from "@/features/tickets/server/ticketService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface TicketPriorityRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: TicketPriorityRouteProps,
) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const parsedParams = ticketStatusParamsSchema.safeParse(await params);
  const parsedBody = ticketPrioritySchema.safeParse(await request.json());

  if (!parsedParams.success || !parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid priority update payload",
      400,
    );
  }

  const ticket = await updateTicketPriority(
    parsedParams.data.id,
    parsedBody.data.priority,
  );

  if (!ticket) {
    return errorResponse("NOT_FOUND", "Ticket not found", 404);
  }

  const application = await getApplicationById(ticket.appId);
  revalidateTag("tickets", "max");

  if (application) {
    revalidateTag(`application-${application.slug}`, "max");
  }

  return NextResponse.json(ticket);
}
