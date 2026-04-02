import type { TicketAiAnalysis } from "@/features/tickets/server/ticketAiAnalysis.schemas";
import {
  clampScore,
  getUniqueSignals,
  normalizeText,
} from "@/features/tickets/server/ticketAiRanking";
import type {
  RankedTicketDuplicateCandidate,
  TicketForAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis.types";

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
