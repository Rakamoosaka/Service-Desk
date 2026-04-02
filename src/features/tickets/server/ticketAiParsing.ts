import JSON5 from "json5";
import {
  normalizeProviderAnalysis,
  parseProviderTicketAiAnalysisInput,
  ticketAiAnalysisSchema,
} from "@/features/tickets/server/ticketAiAnalysis.schemas";

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

export function parseProviderTicketAnalysis(rawValue: unknown) {
  if (typeof rawValue === "object" && rawValue !== null) {
    return ticketAiAnalysisSchema.parse(
      normalizeProviderAnalysis(parseProviderTicketAiAnalysisInput(rawValue)),
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
      parseProviderTicketAiAnalysisInput(JSON5.parse(jsonText)),
    ),
  );
}
