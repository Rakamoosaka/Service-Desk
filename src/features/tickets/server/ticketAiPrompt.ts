import type {
  RankedTicketDuplicateCandidate,
  TicketForAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis.types";

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
