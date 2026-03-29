import { NextRequest, NextResponse } from "next/server";
import { getServiceBySlugs } from "@/features/services/server/serviceService";
import { getServiceUptime } from "@/features/uptime/server/uptimeService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface UptimeRouteProps {
  params: Promise<{
    applicationSlug: string;
    serviceSlug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: UptimeRouteProps) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  const { applicationSlug, serviceSlug } = await params;
  const service = await getServiceBySlugs(applicationSlug, serviceSlug);

  if (!service) {
    return errorResponse("NOT_FOUND", "Service not found", 404);
  }

  const snapshot = await getServiceUptime(
    service.application.uptimeKumaIdentifier,
    service.kumaMonitorId,
    service.name,
  );

  return NextResponse.json(snapshot);
}
