import { z } from "zod";
import { ticketAiTriageSchema } from "@/features/tickets/ticketAi";
import type {
  TicketImpact,
  TicketSentiment,
} from "@/features/tickets/server/ticketAiAnalysis.types";

export const ticketAiAnalysisSchema = z.object({
  priority: z.enum(["low", "medium", "high", "critical"]),
  suspectedDuplicateTicketId: z.string().uuid().nullable(),
  ...ticketAiTriageSchema.shape,
});

export type TicketAiAnalysis = z.infer<typeof ticketAiAnalysisSchema>;

const providerTicketAiAnalysisSchema = z.object({
  priority: z.enum(["low", "medium", "high", "critical"]),
  suspectedDuplicateTicketId: z.string().uuid().nullable().optional(),
  duplicate_of: z.string().uuid().nullable().optional(),
  recommendedType: z.enum(["feedback", "suggestion", "bug"]).optional(),
  type: z.enum(["feedback", "suggestion", "bug"]).optional(),
  recommendedTypeConfidence: z.number().min(0).max(100).optional(),
  typeReason: z.string().min(1).max(400).optional(),
  priorityReason: z.string().min(1).max(400).optional(),
  reason: z.string().min(1).max(400).optional(),
  sentiment: z.enum(["negative", "neutral", "positive"]).optional(),
  technicalImpact: z.enum(["low", "medium", "high", "critical"]).optional(),
  duplicateReason: z.string().max(400).nullable().optional(),
  duplicateScore: z.number().min(0).max(100).nullable().optional(),
  duplicateSignals: z.array(z.string().min(1).max(120)).max(5).optional(),
});

const providerTicketAiAnalysisInputSchema = z
  .object({
    priority: z.enum(["low", "medium", "high", "critical"]),
    suspectedDuplicateTicketId: z.string().uuid().nullable().optional(),
    duplicate_of: z.string().uuid().nullable().optional(),
    recommendedType: z.enum(["feedback", "suggestion", "bug"]).optional(),
    type: z.enum(["feedback", "suggestion", "bug"]).optional(),
    recommendedTypeConfidence: z.unknown().optional(),
    typeReason: z.string().min(1).max(400).optional(),
    priorityReason: z.string().min(1).max(400).optional(),
    reason: z.string().min(1).max(400).optional(),
    sentiment: z.unknown().optional(),
    technicalImpact: z.unknown().optional(),
    duplicateReason: z.string().max(400).nullable().optional(),
    duplicateScore: z.unknown().optional(),
    duplicateSignals: z.array(z.string().min(1).max(120)).max(5).optional(),
  })
  .transform((value) => ({
    ...value,
    recommendedTypeConfidence: coerceNumber(value.recommendedTypeConfidence),
    sentiment: normalizeSentiment(value.sentiment),
    technicalImpact: normalizeImpact(value.technicalImpact),
    duplicateScore:
      value.duplicateScore === null ? null : coerceNumber(value.duplicateScore),
  }));

function coerceNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/%$/, "");

    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeImpact(value: unknown): TicketImpact | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, " ");

  if (
    ["low", "minor", "small", "light", "limited", "minimal"].includes(
      normalized,
    )
  ) {
    return "low";
  }

  if (["medium", "moderate", "normal", "noticeable"].includes(normalized)) {
    return "medium";
  }

  if (
    ["high", "major", "severe", "significant", "large"].includes(normalized)
  ) {
    return "high";
  }

  if (
    ["critical", "urgent", "outage", "blocking", "blocker"].includes(normalized)
  ) {
    return "critical";
  }

  return undefined;
}

function normalizeSentiment(value: unknown): TicketSentiment | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, " ");

  if (!normalized) {
    return undefined;
  }

  if (
    [
      "positive",
      "appreciative",
      "grateful",
      "happy",
      "pleased",
      "satisfied",
      "thankful",
    ].includes(normalized)
  ) {
    return "positive";
  }

  if (
    [
      "negative",
      "frustrated",
      "unhappy",
      "upset",
      "angry",
      "annoyed",
      "dissatisfied",
      "complaint",
      "complaining",
      "urgent",
    ].includes(normalized)
  ) {
    return "negative";
  }

  if (["neutral", "mixed", "informational", "factual"].includes(normalized)) {
    return "neutral";
  }

  if (normalized.includes("thank") || normalized.includes("appreciat")) {
    return "positive";
  }

  if (
    normalized.includes("frustrat") ||
    normalized.includes("urgent") ||
    normalized.includes("complain") ||
    normalized.includes("negative")
  ) {
    return "negative";
  }

  if (normalized.includes("neutral") || normalized.includes("mixed")) {
    return "neutral";
  }

  return undefined;
}

export function parseProviderTicketAiAnalysisInput(rawValue: unknown) {
  return providerTicketAiAnalysisSchema.parse(
    providerTicketAiAnalysisInputSchema.parse(rawValue),
  );
}

export function normalizeProviderAnalysis(
  raw: z.infer<typeof providerTicketAiAnalysisSchema>,
) {
  const recommendedType = raw.recommendedType ?? raw.type;
  const sharedReason = raw.reason ?? raw.typeReason ?? raw.priorityReason;
  const duplicateId =
    raw.suspectedDuplicateTicketId ?? raw.duplicate_of ?? null;
  const duplicateSignals = raw.duplicateSignals ?? [];

  return {
    priority: raw.priority,
    suspectedDuplicateTicketId: duplicateId,
    recommendedType,
    recommendedTypeConfidence: raw.recommendedTypeConfidence ?? 70,
    typeReason:
      raw.typeReason ??
      sharedReason ??
      "The classification is based on the wording in the ticket.",
    priorityReason:
      raw.priorityReason ??
      sharedReason ??
      "The priority is based on the apparent urgency and impact in the ticket.",
    sentiment: raw.sentiment ?? "neutral",
    technicalImpact:
      raw.technicalImpact ??
      (raw.priority === "critical"
        ? "critical"
        : raw.priority === "high"
          ? "high"
          : raw.priority === "medium"
            ? "medium"
            : "low"),
    duplicateReason:
      raw.duplicateReason ??
      (duplicateId
        ? (sharedReason ?? "Possible duplicate based on similar wording.")
        : null),
    duplicateScore: raw.duplicateScore ?? (duplicateId ? 72 : null),
    duplicateSignals,
  };
}
