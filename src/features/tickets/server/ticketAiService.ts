import { Agent } from "@mastra/core/agent";
import { env } from "@/lib/env";
import {
  getTicketById,
  listTicketDuplicateCandidates,
  setTicketAnalysisState,
  updateTicketAutomation,
} from "@/features/tickets/server/ticketService";
import {
  buildTicketTriagePrompt,
  rankTicketDuplicateCandidates,
  resolveTicketAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis";

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
Return the final answer as a valid JSON object that matches the requested schema.
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

export async function analyzeTicketAutomation(ticketId: string) {
  const agent = getTicketTriageAgent();

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  await setTicketAnalysisState(ticketId, "pending");

  try {
    const rawCandidates = await listTicketDuplicateCandidates(ticketId);
    const rankedCandidates = rankTicketDuplicateCandidates(
      ticket,
      rawCandidates,
    );
    const prompt = buildTicketTriagePrompt(ticket, rankedCandidates);
    const analysis = await resolveTicketAnalysis({
      ticket,
      rankedCandidates,
      generateAnalysis: agent
        ? async () => {
            const response = await agent.generate(prompt);

            return response.text;
          }
        : undefined,
    });

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
