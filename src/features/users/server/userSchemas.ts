import { z } from "zod";

export const userRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export const userRoleParamsSchema = z.object({
  id: z.string().min(1),
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;
