import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  getTicketById,
  listTicketDuplicateCandidates,
  setTicketAnalysisState,
  updateTicketAutomation,
} from "@/features/tickets/server/ticketService";
import { ticketAiTriageSchema } from "@/features/tickets/ticketAi";

const ticketAiAnalysisSchema = z.object({
  priority: z.enum(["low", "medium", "high", "critical"]),
  suspectedDuplicateTicketId: z.string().uuid().nullable(),
  ...ticketAiTriageSchema.shape,
});

function getTicketTriageAgent() {
  const openRouterEnabled =
    Boolean(env.OPENROUTER_API_KEY) &&
    Boolean(env.OPENROUTER_BASE_URL) &&
    Boolean(env.OPENROUTER_MODEL);

  if (!openRouterEnabled && !env.OPENAI_API_KEY) {
    return null;
  }

  return new Agent({
    id: "ticket-triage-agent",
    name: "Ticket Triage Agent",
    instructions: `You analyze internal service desk tickets.

Decide priority from the technical urgency and business impact in the ticket title and description.
Recommend the most accurate ticket type from feedback, suggestion, or bug.
Only mark a duplicate when a candidate clearly describes the same underlying issue or request.
Be conservative. If the evidence is weak, do not flag a duplicate.
Return concise reasons grounded in the ticket text and the provided candidates.
Never invent ticket IDs outside the provided candidate list.`,
    model: openRouterEnabled
      ? {
          providerId: "openrouter",
          modelId: env.OPENROUTER_MODEL!,
          url: env.OPENROUTER_BASE_URL,
          apiKey: env.OPENROUTER_API_KEY,
          headers: {
            "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
            "X-Title": "KOZ AI Service Desk",
          },
        }
      : {
          id: "openai/gpt-5-mini",
          apiKey: env.OPENAI_API_KEY,
        },
    maxRetries: 1,
  });
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scoreCandidate(
  source: { title: string; description: string; serviceId: string | null },
  candidate: { title: string; description: string; serviceId: string | null },
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

export async function analyzeTicketAutomation(ticketId: string) {
  const agent = getTicketTriageAgent();

  if (!agent) {
    return getTicketById(ticketId);
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  await setTicketAnalysisState(ticketId, "pending");

  try {
    const rawCandidates = await listTicketDuplicateCandidates(ticketId);
    const rankedCandidates = rawCandidates
      .map((candidate) => ({
        ...candidate,
        rankScore: scoreCandidate(ticket, candidate),
      }))
      .sort((left, right) => right.rankScore - left.rankScore)
      .slice(0, 6);

    const prompt = [
      "Analyze this support ticket and return structured triage output.",
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
    ].join("\n\n");

    const response = await agent.generate(prompt, {
      structuredOutput: {
        schema: ticketAiAnalysisSchema,
      },
    });

    const analysis = response.object;

    if (!analysis) {
      throw new Error("Ticket analysis returned no structured output");
    }

    const validDuplicateId = rankedCandidates.some(
      (candidate) => candidate.id === analysis.suspectedDuplicateTicketId,
    )
      ? analysis.suspectedDuplicateTicketId
      : null;

    const hasPendingSuggestion =
      analysis.recommendedType !== ticket.type || Boolean(validDuplicateId);

    await updateTicketAutomation(ticketId, {
      priority: analysis.priority,
      aiTriage: {
        recommendedType: analysis.recommendedType,
        recommendedTypeConfidence: analysis.recommendedTypeConfidence,
        typeReason: analysis.typeReason,
        priorityReason: analysis.priorityReason,
        sentiment: analysis.sentiment,
        technicalImpact: analysis.technicalImpact,
        duplicateReason: validDuplicateId ? analysis.duplicateReason : null,
        duplicateScore: validDuplicateId ? analysis.duplicateScore : null,
        duplicateSignals: validDuplicateId ? analysis.duplicateSignals : [],
      },
      suspectedDuplicateTicketId: validDuplicateId,
      aiSuggestionStatus: hasPendingSuggestion ? "pending_review" : "none",
      analysisState: "completed",
    });

    return getTicketById(ticketId);
  } catch (error) {
    console.error("Ticket automation failed", error);

    await updateTicketAutomation(ticketId, {
      priority: ticket.priority,
      aiTriage: ticket.aiTriage ?? {},
      suspectedDuplicateTicketId: ticket.suspectedDuplicateTicketId,
      aiSuggestionStatus: ticket.aiSuggestionStatus,
      analysisState: "failed",
    });

    return getTicketById(ticketId);
  }
}
