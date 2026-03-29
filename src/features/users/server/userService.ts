import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { UserRoleInput } from "@/features/users/server/userSchemas";

export async function listUsers() {
  return db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      gitlabUserId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [asc(users.name)],
  });
}

export async function listAdminNotificationRecipients() {
  return db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    },
    where: eq(users.role, "admin"),
    orderBy: [asc(users.name)],
  });
}

export async function updateUserRole(id: string, input: UserRoleInput) {
  const [user] = await db
    .update(users)
    .set({
      role: input.role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      role: users.role,
    });

  return user ?? null;
}
