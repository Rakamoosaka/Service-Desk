import { z } from "zod";

export const ticketInputSchema = z.object({
  appId: z.string().uuid(),
  type: z.enum(["feedback", "suggestion", "bug"]),
  title: z.string().min(4).max(120),
  description: z.string().min(16).max(2000),
});

export const ticketFiltersSchema = z.object({
  status: z.enum(["new", "in_review", "resolved", "closed"]).optional(),
  type: z.enum(["feedback", "suggestion", "bug"]).optional(),
  search: z.string().trim().max(120).optional(),
});

export const ticketStatusSchema = z.object({
  status: z.enum(["new", "in_review", "resolved", "closed"]),
});

export const ticketStatusParamsSchema = z.object({
  id: z.string().uuid(),
});

export type TicketInput = z.infer<typeof ticketInputSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
