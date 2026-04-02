import type {
  RankedTicketDuplicateCandidate,
  TicketDuplicateCandidate,
  TicketForAnalysis,
} from "@/features/tickets/server/ticketAiAnalysis.types";

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function getUniqueSignals(tokens: string[]) {
  return Array.from(new Set(tokens)).slice(0, 5);
}

export function clampScore(value: number, minimum: number, maximum: number) {
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
    .slice(0, 6) satisfies RankedTicketDuplicateCandidate[];
}
