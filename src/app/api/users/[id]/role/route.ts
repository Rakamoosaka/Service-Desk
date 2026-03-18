import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { updateUserRole } from "@/features/users/server/userService";
import {
  userRoleParamsSchema,
  userRoleSchema,
} from "@/features/users/server/userSchemas";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

interface UserRoleRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: UserRoleRouteProps,
) {
  const session = await getSessionFromRequest(request.headers);

  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  if (session.user.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  const parsedParams = userRoleParamsSchema.safeParse(await params);
  const parsedBody = userRoleSchema.safeParse(await request.json());

  if (!parsedParams.success || !parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid role update payload",
      400,
    );
  }

  const user = await updateUserRole(parsedParams.data.id, parsedBody.data);

  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  revalidateTag("users", "max");

  return NextResponse.json(user);
}
