import { z } from "zod";

export const serviceMetadataInputSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().min(12).max(600),
});

export const serviceIdSchema = z.object({
  id: z.string().uuid(),
});

export type ServiceMetadataInput = z.infer<typeof serviceMetadataInputSchema>;
