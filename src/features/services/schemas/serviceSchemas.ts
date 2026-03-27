import { z } from "zod";

export const serviceInputSchema = z.object({
  applicationId: z.string().uuid(),
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

export const serviceIdSchema = z.object({
  id: z.string().uuid(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
