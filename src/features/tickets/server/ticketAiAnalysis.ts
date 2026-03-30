import JSON5 from "json5";
import { z } from "zod";
import { ticketAiTriageSchema } from "@/features/tickets/ticketAi";

export const ticketAiAnalysisSchema = z.object({
  priority: z.enum(["low", "medium", "high", "critical"]),
  suspectedDuplicateTicketId: z.string().uuid().nullable(),
  ...ticketAiTriageSchema.shape,
});

export type TicketAiAnalysis = z.infer<typeof ticketAiAnalysisSchema>;

export type TicketForAnalysis = {
  type: "feedback" | "suggestion" | "bug";
  title: string;
  description: string;
  serviceId: string | null;
  application: {
    name: string;
    slug: string;
  };
  service: {
    name: string;
  } | null;
};

export type TicketDuplicateCandidate = {
  id: string;
  title: string;
  description: string;
  type: "feedback" | "suggestion" | "bug";
  status: "new" | "in_review" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical" | "unknown";
  serviceId: string | null;
};

export type RankedTicketDuplicateCandidate = TicketDuplicateCandidate & {
  rankScore: number;
};

type TicketImpact = "low" | "medium" | "high" | "critical";
type TicketSentiment = "negative" | "neutral" | "positive";

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
  }))
  .pipe(providerTicketAiAnalysisSchema);

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function getUniqueSignals(tokens: string[]) {
  return Array.from(new Set(tokens)).slice(0, 5);
}

function clampScore(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function scoreCandidate(
  source: Pick<TicketForAnalysis, "title" | "description" | "serviceId">,
  candidate: Pick<
    TicketDuplicateCandidate,
    "title" | "description" | "serviceId"
  >,
) {
  const sourceTokens = new Set([
    ...normalizeText(source.title),
    ...normalizeText(source.description),
  ]);
  const candidateTokens = new Set([
    ...normalizeText(candidate.title),
    ...normalizeText(candidate.description),
  ]);

  let overlap = 0;

  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) {
      overlap += 1;
    }
  }

  return (
    overlap +
    (source.serviceId && source.serviceId === candidate.serviceId ? 3 : 0) +
    (source.title.toLowerCase() === candidate.title.toLowerCase() ? 4 : 0)
  );
}

export function rankTicketDuplicateCandidates(
  ticket: TicketForAnalysis,
  candidates: TicketDuplicateCandidate[],
) {
  return candidates
    .map((candidate) => ({
      ...candidate,
      rankScore: scoreCandidate(ticket, candidate),
    }))
    .sort((left, right) => right.rankScore - left.rankScore)
    .slice(0, 6);
}

export function buildTicketTriagePrompt(
  ticket: TicketForAnalysis,
  rankedCandidates: RankedTicketDuplicateCandidate[],
) {
  return [
    "Analyze this support ticket and return structured triage output as a valid JSON object.",
    `Current user-selected type: ${ticket.type}`,
    `Application: ${ticket.application.name} (${ticket.application.slug})`,
    `Service: ${ticket.service?.name ?? "application-level"}`,
    `Title: ${ticket.title}`,
    `Description: ${ticket.description}`,
    "Candidate duplicate tickets:",
    rankedCandidates.length
      ? rankedCandidates
          .map(
            (candidate) =>
              `- ID: ${candidate.id}\n  Title: ${candidate.title}\n  Type: ${candidate.type}\n  Status: ${candidate.status}\n  Priority: ${candidate.priority}\n  Description: ${candidate.description}`,
          )
          .join("\n")
      : "- No relevant candidates provided. Use null for suspectedDuplicateTicketId.",
    "Set priority to critical only for outages, security/data loss, or severe business blocking impact.",
    "Set priority to high for major workflow blockers without a full outage.",
    "Set priority to medium for meaningful but non-blocking impact.",
    "Set priority to low for light feedback, cosmetic issues, or optional improvements.",
    'Allowed enum values: priority = "low" | "medium" | "high" | "critical"; recommendedType = "feedback" | "suggestion" | "bug"; sentiment = "negative" | "neutral" | "positive"; technicalImpact = "low" | "medium" | "high" | "critical".',
    "Required JSON fields: priority, suspectedDuplicateTicketId, recommendedType, recommendedTypeConfidence, typeReason, priorityReason, sentiment, technicalImpact, duplicateReason, duplicateScore, duplicateSignals.",
    "Use null for suspectedDuplicateTicketId, duplicateReason, and duplicateScore when there is no likely duplicate.",
    "Use an empty array for duplicateSignals when there is no likely duplicate.",
    "JSON requirement: respond with JSON only and no markdown.",
  ].join("\n\n");
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  const startIndex = candidate.indexOf("{");
  const endIndex = candidate.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  return candidate.slice(startIndex, endIndex + 1);
}

function normalizeProviderAnalysis(
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

export function parseProviderTicketAnalysis(rawValue: unknown) {
  if (typeof rawValue === "object" && rawValue !== null) {
    return ticketAiAnalysisSchema.parse(
      normalizeProviderAnalysis(
        providerTicketAiAnalysisInputSchema.parse(rawValue),
      ),
    );
  }

  if (typeof rawValue !== "string") {
    throw new Error("Ticket analysis returned no parseable content");
  }

  const jsonText = extractJsonObject(rawValue);

  if (!jsonText) {
    throw new Error("Ticket analysis returned no JSON object");
  }

  return ticketAiAnalysisSchema.parse(
    normalizeProviderAnalysis(
      providerTicketAiAnalysisInputSchema.parse(JSON5.parse(jsonText)),
    ),
  );
}

function deriveRecommendedType(ticket: TicketForAnalysis) {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  const suggestionPattern =
    /\b(feature|enhancement|improve|improvement|request|suggest|would like|could you|should have)\b/;
  const feedbackPattern =
    /\b(thanks|thank you|love|great|nice|feedback|appreciate)\b/;
  const bugPattern =
    /\b(bug|error|issue|broken|fail|fails|failing|not working|cannot|can't|crash|problem|outage|down)\b/;

  if (suggestionPattern.test(text)) {
    return { recommendedType: "suggestion" as const, confidence: 84 };
  }

  if (feedbackPattern.test(text) && !bugPattern.test(text)) {
    return { recommendedType: "feedback" as const, confidence: 78 };
  }

  if (bugPattern.test(text)) {
    return { recommendedType: "bug" as const, confidence: 88 };
  }

  return { recommendedType: ticket.type, confidence: 62 };
}

function derivePriority(ticket: TicketForAnalysis) {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  const criticalPattern =
    /\b(outage|down|security|breach|data loss|production down|everyone blocked|service unavailable|cannot log in|can't log in)\b/;
  const highPattern =
    /\b(blocked|urgent|asap|cannot|can't|failing|broken|major|stuck|unable to)\b/;
  const mediumPattern = /\b(slow|intermittent|degraded|confusing|incorrect)\b/;

  if (criticalPattern.test(text)) {
    return {
      priority: "critical" as const,
      technicalImpact: "critical" as const,
      reason:
        "The ticket indicates an outage, security risk, data loss, or a severe business blocker.",
    };
  }

  if (highPattern.test(text)) {
    return {
      priority: "high" as const,
      technicalImpact: "high" as const,
      reason:
        "The ticket describes a meaningful workflow blocker without evidence of a full outage.",
    };
  }

  if (mediumPattern.test(text)) {
    return {
      priority: "medium" as const,
      technicalImpact: "medium" as const,
      reason:
        "The issue appears to cause noticeable friction but does not clearly block core work.",
    };
  }

  return {
    priority: "low" as const,
    technicalImpact: "low" as const,
    reason:
      "The ticket reads as light feedback, a minor issue, or an optional improvement.",
  };
}

function deriveSentiment(ticket: TicketForAnalysis) {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  if (/\b(thanks|thank you|love|great|awesome|nice)\b/.test(text)) {
    return "positive" as const;
  }

  if (
    /\b(bug|error|broken|fail|urgent|blocked|problem|issue|down|outage)\b/.test(
      text,
    )
  ) {
    return "negative" as const;
  }

  return "neutral" as const;
}

function deriveDuplicateInsight(
  ticket: TicketForAnalysis,
  rankedCandidates: RankedTicketDuplicateCandidate[],
) {
  const bestCandidate = rankedCandidates[0];

  if (!bestCandidate || bestCandidate.rankScore < 6) {
    return {
      suspectedDuplicateTicketId: null,
      duplicateReason: null,
      duplicateScore: null,
      duplicateSignals: [] as string[],
    };
  }

  const sourceTokens = new Set([
    ...normalizeText(ticket.title),
    ...normalizeText(ticket.description),
  ]);
  const candidateTokens = normalizeText(
    `${bestCandidate.title} ${bestCandidate.description}`,
  );
  const sharedSignals = getUniqueSignals(
    candidateTokens.filter((token) => sourceTokens.has(token)),
  );
  const duplicateScore = clampScore(bestCandidate.rankScore * 12, 55, 98);

  return {
    suspectedDuplicateTicketId: bestCandidate.id,
    duplicateReason:
      sharedSignals.length > 0
        ? `The ticket overlaps strongly with an existing item on ${sharedSignals.join(", ")} and service context.`
        : "The ticket closely matches an existing item in title, service context, and wording.",
    duplicateScore,
    duplicateSignals: sharedSignals,
  };
}

export function createHeuristicTicketAnalysis(
  ticket: TicketForAnalysis,
  rankedCandidates: RankedTicketDuplicateCandidate[],
): TicketAiAnalysis {
  const { recommendedType, confidence } = deriveRecommendedType(ticket);
  const priority = derivePriority(ticket);
  const duplicate = deriveDuplicateInsight(ticket, rankedCandidates);

  return {
    priority: priority.priority,
    recommendedType,
    recommendedTypeConfidence: confidence,
    typeReason:
      recommendedType === ticket.type
        ? `The wording supports the current ${ticket.type} classification.`
        : `The wording better matches a ${recommendedType} request than the current ${ticket.type} classification.`,
    priorityReason: priority.reason,
    sentiment: deriveSentiment(ticket),
    technicalImpact: priority.technicalImpact,
    suspectedDuplicateTicketId: duplicate.suspectedDuplicateTicketId,
    duplicateReason: duplicate.duplicateReason,
    duplicateScore: duplicate.duplicateScore,
    duplicateSignals: duplicate.duplicateSignals,
  };
}

export async function resolveTicketAnalysis(options: {
  ticket: TicketForAnalysis;
  rankedCandidates: RankedTicketDuplicateCandidate[];
  generateAnalysis?: () => Promise<unknown>;
}) {
  const { ticket, rankedCandidates, generateAnalysis } = options;

  if (!generateAnalysis) {
    return createHeuristicTicketAnalysis(ticket, rankedCandidates);
  }

  try {
    return parseProviderTicketAnalysis(await generateAnalysis());
  } catch (error) {
    console.error("Ticket automation fell back to heuristic analysis", error);
    return createHeuristicTicketAnalysis(ticket, rankedCandidates);
  }
}
