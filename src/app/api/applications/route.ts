import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { applicationInputSchema } from "@/features/applications/schemas/applicationSchemas";
import {
  createApplication,
  listApplications,
} from "@/features/applications/server/applicationService";
import { errorResponse } from "@/lib/http";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  const applications = await listApplications();
  return NextResponse.json(applications);
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
  const parsed = applicationInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid application payload",
      400,
    );
  }

  const application = await createApplication(parsed.data);
  revalidateTag("applications", "max");
  revalidateTag(`application-${application.slug}`, "max");

  return NextResponse.json(application, { status: 201 });
}
