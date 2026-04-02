import { NextRequest, NextResponse } from "next/server";
import {
  ticketResponseSchema,
  ticketStatusParamsSchema,
} from "@/features/tickets/schemas/ticketSchemas";
import { sendTicketResponseEmail } from "@/features/tickets/server/sendTicketResponseEmail";
import { getTicketById } from "@/features/tickets/server/ticketService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rateLimit";

interface TicketResponseRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: TicketResponseRouteProps,
) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const rateLimitResponse = await enforceRateLimit(request, {
    policy: "ticketRespond",
    userId: session.user.id,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const parsedParams = ticketStatusParamsSchema.safeParse(await params);
  const parsedBody = ticketResponseSchema.safeParse(await request.json());

  if (!parsedParams.success || !parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsedBody.success
        ? "Invalid ticket response payload"
        : (parsedBody.error.issues[0]?.message ??
            "Invalid ticket response payload"),
      400,
    );
  }

  const ticket = await getTicketById(parsedParams.data.id);

  if (!ticket) {
    return errorResponse("NOT_FOUND", "Ticket not found", 404);
  }

  try {
    await sendTicketResponseEmail({
      applicationName: ticket.application.name,
      ticketTitle: ticket.title,
      ticketDescription: ticket.description,
      responseMessage: parsedBody.data.message,
      submittedBy: {
        name: ticket.submittedBy.name,
        email: ticket.submittedBy.email,
      },
    });
  } catch (error) {
    console.error("Failed to send ticket response", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to send ticket response",
      500,
    );
  }

  return NextResponse.json({ success: true });
}
