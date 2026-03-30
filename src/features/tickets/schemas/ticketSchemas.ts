import { z } from "zod";
import { ticketAiReviewSchema } from "@/features/tickets/ticketAi";

export const ticketInputSchema = z.object({
  appId: z.string().uuid(),
  serviceId: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["feedback", "suggestion", "bug"]),
  title: z.string().min(4).max(120),
  description: z.string().min(16).max(2000),
});

export const ticketFiltersSchema = z.object({
  appId: z.string().uuid().optional(),
  status: z.enum(["new", "in_review", "resolved", "closed"]).optional(),
  type: z.enum(["feedback", "suggestion", "bug"]).optional(),
  search: z.string().trim().max(120).optional(),
});

export function parseTicketFilters(searchParams: URLSearchParams) {
  return ticketFiltersSchema.safeParse({
    appId: searchParams.get("appId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });
}

export const ticketStatusSchema = z.object({
  status: z.enum(["new", "in_review", "resolved", "closed"]),
});

export const ticketStatusParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ticketAiReviewParamsSchema = z.object({
  id: z.string().uuid(),
});

export type TicketInput = z.infer<typeof ticketInputSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type TicketAiReviewInput = z.infer<typeof ticketAiReviewSchema>;
