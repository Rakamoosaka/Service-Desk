import { z } from "zod";
import { ticketAiReviewSchema } from "@/features/tickets/ticketAi";

export const ticketStatusValues = [
  "new",
  "in_review",
  "resolved",
  "closed",
] as const;
export const ticketPriorityValues = [
  "low",
  "medium",
  "high",
  "critical",
  "unknown",
] as const;

export const ticketInputSchema = z.object({
  appId: z.string().uuid(),
  serviceId: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["feedback", "suggestion", "bug"]),
  title: z.string().min(4).max(120),
  description: z.string().min(16).max(2000),
});

export const ticketFiltersSchema = z.object({
  appId: z.string().uuid().optional(),
  status: z.enum(ticketStatusValues).optional(),
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
  status: z.enum(ticketStatusValues),
});

export const ticketPrioritySchema = z.object({
  priority: z.enum(ticketPriorityValues),
});

export const bulkTicketUpdateSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(200),
    status: z.enum(ticketStatusValues).optional(),
    priority: z.enum(ticketPriorityValues).optional(),
  })
  .refine(
    (value) =>
      Number(Boolean(value.status)) + Number(Boolean(value.priority)) === 1,
    {
      message: "Provide exactly one bulk ticket update action",
      path: ["status"],
    },
  );

export const bulkTicketUpdateResponseSchema = z.object({
  updatedCount: z.number().int().min(0),
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
export type BulkTicketUpdateInput = z.infer<typeof bulkTicketUpdateSchema>;
