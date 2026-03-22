import { NextRequest, NextResponse } from "next/server";
import { getApplicationBySlug } from "@/features/applications/server/applicationService";
import { getApplicationUptimeByIdentifier } from "@/features/uptime/server/uptimeService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface UptimeRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: UptimeRouteProps) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  const { slug } = await params;
  const application = await getApplicationBySlug(slug);

  if (!application) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  const snapshot = await getApplicationUptimeByIdentifier(
    application.uptimeKumaIdentifier ?? "",
  );

  return NextResponse.json(snapshot);
}
