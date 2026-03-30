import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getApplicationById } from "@/features/applications/server/applicationService";
import { ticketAiReviewSchema } from "@/features/tickets/ticketAi";
import { ticketAiReviewParamsSchema } from "@/features/tickets/schemas/ticketSchemas";
import { reviewTicketAiSuggestions } from "@/features/tickets/server/ticketService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface TicketAiReviewRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: TicketAiReviewRouteProps,
) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const parsedParams = ticketAiReviewParamsSchema.safeParse(await params);
  const parsedBody = ticketAiReviewSchema.safeParse(await request.json());

  if (!parsedParams.success || !parsedBody.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid AI review payload", 400);
  }

  const ticket = await reviewTicketAiSuggestions(
    parsedParams.data.id,
    parsedBody.data.action,
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
