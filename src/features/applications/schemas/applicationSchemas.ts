import { z } from "zod";

export const applicationInputSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().min(12).max(600),
  uptimeKumaIdentifier: z
    .string()
    .min(1, "Uptime identifier is required")
    .max(120),
});

export const applicationIdSchema = z.object({
  id: z.string().uuid(),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;
