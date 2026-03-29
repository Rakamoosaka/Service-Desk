import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  serviceIdSchema,
  serviceMetadataInputSchema,
} from "@/features/services/schemas/serviceSchemas";
import {
  getServiceById,
  updateServiceMetadata,
} from "@/features/services/server/serviceService";
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
  const parsedBody = serviceMetadataInputSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsedBody.error.issues[0]?.message ?? "Invalid service payload",
      400,
    );
  }

  const existingService = await getServiceById(parsedParams.data.id);

  if (!existingService) {
    return errorResponse("NOT_FOUND", "Service not found", 404);
  }

  const service = await updateServiceMetadata(
    parsedParams.data.id,
    parsedBody.data,
  );

  if (!service) {
    return errorResponse("NOT_FOUND", "Service not found", 404);
  }

  revalidateTag("applications", "max");
  revalidateTag(`application-${existingService.application.slug}`, "max");

  return NextResponse.json(service);
}

export async function DELETE(
  request: NextRequest,
  { params }: ServiceRouteProps,
) {
  void request;
  void params;

  return errorResponse(
    "VALIDATION_ERROR",
    "Synced services can only be retired by removing them from the linked Uptime Kuma status page",
    405,
  );
}
