import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  applicationIdSchema,
  applicationInputSchema,
} from "@/features/applications/schemas/applicationSchemas";
import {
  getApplicationById,
  deleteApplication,
  updateApplication,
} from "@/features/applications/server/applicationService";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface ApplicationRouteProps {
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
  { params }: ApplicationRouteProps,
) {
  const authError = await requireAdmin(request.headers);

  if (authError) {
    return authError;
  }

  const parsedParams = applicationIdSchema.safeParse(await params);

  if (!parsedParams.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid application id", 400);
  }

  const body = await request.json();
  const parsedBody = applicationInputSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsedBody.error.issues[0]?.message ?? "Invalid application payload",
      400,
    );
  }

  const previousApplication = await getApplicationById(parsedParams.data.id);

  try {
    const application = await updateApplication(
      parsedParams.data.id,
      parsedBody.data,
    );

    if (!application) {
      return errorResponse("NOT_FOUND", "Application not found", 404);
    }

    revalidateTag("applications", "max");
    revalidateTag(`application-${application.slug}`, "max");
    if (previousApplication && previousApplication.slug !== application.slug) {
      revalidateTag(`application-${previousApplication.slug}`, "max");
    }

    return NextResponse.json(application);
  } catch (error) {
    return errorResponse(
      "VALIDATION_ERROR",
      error instanceof Error
        ? error.message
        : "Unable to validate the Uptime Kuma identifier",
      400,
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: ApplicationRouteProps,
) {
  const authError = await requireAdmin(request.headers);

  if (authError) {
    return authError;
  }

  const parsedParams = applicationIdSchema.safeParse(await params);

  if (!parsedParams.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid application id", 400);
  }

  const application = await deleteApplication(parsedParams.data.id);

  if (!application) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  revalidateTag("applications", "max");
  revalidateTag(`application-${application.slug}`, "max");

  return NextResponse.json({ success: true });
}
