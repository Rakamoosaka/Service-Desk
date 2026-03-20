import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/features/analytics/server/analyticsService";
import { analyticsFiltersSchema } from "@/features/analytics/schemas/analyticsSchemas";
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

  const filters = analyticsFiltersSchema.safeParse({
    range: request.nextUrl.searchParams.get("range") ?? undefined,
  });

  if (!filters.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid analytics range", 400);
  }

  const summary = await getAnalyticsSummary(filters.data.range ?? "30d");
  return NextResponse.json(summary);
}
