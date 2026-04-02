export type {
  RankedTicketDuplicateCandidate,
  TicketDuplicateCandidate,
  TicketForAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis.types";
export {
  ticketAiAnalysisSchema,
  type TicketAiAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis.schemas";
export { createHeuristicTicketAnalysis } from "@/features/tickets/server/ticketAiHeuristics";
export { parseProviderTicketAnalysis } from "@/features/tickets/server/ticketAiParsing";
export { buildTicketTriagePrompt } from "@/features/tickets/server/ticketAiPrompt";
export {
  rankTicketDuplicateCandidates,
  scoreCandidate,
} from "@/features/tickets/server/ticketAiRanking";
import { createHeuristicTicketAnalysis } from "@/features/tickets/server/ticketAiHeuristics";
import { parseProviderTicketAnalysis } from "@/features/tickets/server/ticketAiParsing";
import type {
  RankedTicketDuplicateCandidate,
  TicketForAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis.types";

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
