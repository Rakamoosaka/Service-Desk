import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getApplicationById } from "@/features/applications/server/applicationService";
import {
  bulkTicketUpdateSchema,
  bulkTicketUpdateResponseSchema,
} from "@/features/tickets/schemas/ticketSchemas";
import { bulkUpdateTickets } from "@/features/tickets/server/ticketService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const parsedBody = bulkTicketUpdateSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsedBody.error.issues[0]?.message ??
        "Invalid bulk ticket update payload",
      400,
    );
  }

  const updatedTickets = await bulkUpdateTickets(parsedBody.data);

  if (!updatedTickets.length) {
    return errorResponse("NOT_FOUND", "No matching tickets found", 404);
  }

  revalidateTag("tickets", "max");

  const uniqueApplicationIds = Array.from(
    new Set(updatedTickets.map((ticket) => ticket.appId)),
  );
  const applications = await Promise.all(
    uniqueApplicationIds.map((appId) => getApplicationById(appId)),
  );

  for (const application of applications) {
    if (application) {
      revalidateTag(`application-${application.slug}`, "max");
    }
  }

  const responseBody = bulkTicketUpdateResponseSchema.parse({
    updatedCount: updatedTickets.length,
  });

  return NextResponse.json(responseBody);
}
