import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  await connection();

  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}

export async function getSessionFromRequest(requestHeaders: Headers) {
  return auth.api.getSession({
    headers: requestHeaders,
  });
}
