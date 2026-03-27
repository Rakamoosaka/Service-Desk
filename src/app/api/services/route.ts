import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getApplicationById } from "@/features/applications/server/applicationService";
import { serviceInputSchema } from "@/features/services/schemas/serviceSchemas";
import {
  createService,
  listServices,
} from "@/features/services/server/serviceService";
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

  const body = await request.json();
  const parsed = serviceInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid service payload",
      400,
    );
  }

  const application = await getApplicationById(parsed.data.applicationId);

  if (!application) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  const service = await createService(parsed.data);
  revalidateTag("applications", "max");
  revalidateTag(`application-${application.slug}`, "max");

  return NextResponse.json(service, { status: 201 });
}
