import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  serviceIdSchema,
  serviceInputSchema,
} from "@/features/services/schemas/serviceSchemas";
import {
  deleteService,
  getServiceById,
  updateService,
} from "@/features/services/server/serviceService";
import { getApplicationById } from "@/features/applications/server/applicationService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface ServiceRouteProps {
  params: Promise<{
    id: string;
  }>;
}

async function requireAdmin(headers: Headers) {
  const session = await getSessionFromRequest(headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: ServiceRouteProps,
) {
  const authError = await requireAdmin(request.headers);

  if (authError) {
    return authError;
  }

  const parsedParams = serviceIdSchema.safeParse(await params);

  if (!parsedParams.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid service id", 400);
  }

  const body = await request.json();
  const parsedBody = serviceInputSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsedBody.error.issues[0]?.message ?? "Invalid service payload",
      400,
    );
  }

  const application = await getApplicationById(parsedBody.data.applicationId);

  if (!application) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  const service = await updateService(parsedParams.data.id, parsedBody.data);

  if (!service) {
    return errorResponse("NOT_FOUND", "Service not found", 404);
  }

  revalidateTag("applications", "max");
  revalidateTag(`application-${application.slug}`, "max");

  return NextResponse.json(service);
}

export async function DELETE(
  request: NextRequest,
  { params }: ServiceRouteProps,
) {
  const authError = await requireAdmin(request.headers);

  if (authError) {
    return authError;
  }

  const parsedParams = serviceIdSchema.safeParse(await params);

  if (!parsedParams.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid service id", 400);
  }

  const existing = await getServiceById(parsedParams.data.id);

  if (!existing) {
    return errorResponse("NOT_FOUND", "Service not found", 404);
  }

  const service = await deleteService(parsedParams.data.id);

  if (!service) {
    return errorResponse("NOT_FOUND", "Service not found", 404);
  }

  revalidateTag("applications", "max");
  revalidateTag(`application-${existing.application.slug}`, "max");

  return NextResponse.json({ success: true });
}
