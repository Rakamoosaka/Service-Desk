import { NextRequest, NextResponse } from "next/server";
import { listUsers } from "@/features/users/server/userService";
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

  const users = await listUsers();
  return NextResponse.json(users);
}
