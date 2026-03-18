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
  uptimeKumaIdentifier: z.string().max(120).optional().or(z.literal("")),
});

export const applicationIdSchema = z.object({
  id: z.string().uuid(),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;
