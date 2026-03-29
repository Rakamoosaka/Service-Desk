import { NextRequest, NextResponse } from "next/server";
import { listServices } from "@/features/services/server/serviceService";
import { errorResponse } from "@/lib/http";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const services = await listServices();
  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  return errorResponse(
    "VALIDATION_ERROR",
    "Services are created automatically from the application Uptime Kuma identifier",
    405,
  );
}
