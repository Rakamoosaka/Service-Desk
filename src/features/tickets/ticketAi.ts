import { z } from "zod";

export const ticketAiSuggestionStatusValues = [
  "none",
  "pending_review",
  "accepted",
  "dismissed",
] as const;

export const ticketAiSuggestionStatusSchema = z.enum(
  ticketAiSuggestionStatusValues,
);

export const ticketAiTriageSchema = z.object({
  recommendedType: z.enum(["feedback", "suggestion", "bug"]),
  recommendedTypeConfidence: z.number().min(0).max(100),
  typeReason: z.string().min(1).max(400),
  priorityReason: z.string().min(1).max(400),
  sentiment: z.enum(["negative", "neutral", "positive"]),
  technicalImpact: z.enum(["low", "medium", "high", "critical"]),
  duplicateReason: z.string().max(400).nullable(),
  duplicateScore: z.number().min(0).max(100).nullable(),
  duplicateSignals: z.array(z.string().min(1).max(120)).max(5),
});

export const storedTicketAiTriageSchema = ticketAiTriageSchema.partial();

export const ticketAiReviewSchema = z.object({
  action: z.enum(["accept", "dismiss"]),
});

export type TicketAiSuggestionStatus = z.infer<
  typeof ticketAiSuggestionStatusSchema
>;
export type TicketAiTriage = z.infer<typeof ticketAiTriageSchema>;
export type StoredTicketAiTriage = z.infer<typeof storedTicketAiTriageSchema>;
