import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTicketTriagePrompt,
  createHeuristicTicketAnalysis,
  parseProviderTicketAnalysis,
  rankTicketDuplicateCandidates,
  resolveTicketAnalysis,
} from "./ticketAiAnalysis";

const baseTicket = {
  type: "bug" as const,
  title: "Users cannot log in to payroll",
  description:
    "Production login is failing for everyone and the payroll dashboard is down.",
  serviceId: "service-1",
  application: {
    name: "Payroll",
    slug: "payroll",
  },
  service: {
    name: "Authentication",
  },
};

const duplicateCandidates = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Payroll login is down",
    description: "Users cannot log in to payroll in production.",
    type: "bug" as const,
    status: "new" as const,
    priority: "high" as const,
    serviceId: "service-1",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Add CSV export to payroll",
    description: "Feature request for payroll reporting.",
    type: "suggestion" as const,
    status: "new" as const,
    priority: "low" as const,
    serviceId: "service-2",
  },
];

test("buildTicketTriagePrompt includes explicit JSON instructions", () => {
  const rankedCandidates = rankTicketDuplicateCandidates(
    baseTicket,
    duplicateCandidates,
  );

  const prompt = buildTicketTriagePrompt(baseTicket, rankedCandidates);

  assert.match(prompt, /json/i);
  assert.match(prompt, /JSON only and no markdown/);
  assert.match(prompt, /11111111-1111-4111-8111-111111111111/);
});

test("createHeuristicTicketAnalysis detects severe bug reports", () => {
  const rankedCandidates = rankTicketDuplicateCandidates(
    baseTicket,
    duplicateCandidates,
  );

  const analysis = createHeuristicTicketAnalysis(baseTicket, rankedCandidates);

  assert.equal(analysis.recommendedType, "bug");
  assert.equal(analysis.priority, "critical");
  assert.equal(analysis.technicalImpact, "critical");
  assert.equal(analysis.sentiment, "negative");
  assert.equal(
    analysis.suspectedDuplicateTicketId,
    "11111111-1111-4111-8111-111111111111",
  );
  assert.ok((analysis.duplicateScore ?? 0) >= 55);
  assert.ok(analysis.duplicateSignals.length > 0);
});

test("resolveTicketAnalysis falls back when structured generation throws", async () => {
  const rankedCandidates = rankTicketDuplicateCandidates(
    baseTicket,
    duplicateCandidates,
  );

  const originalConsoleError = console.error;
  console.error = () => {};

  const analysis = await resolveTicketAnalysis({
    ticket: baseTicket,
    rankedCandidates,
    generateAnalysis: async () => {
      throw new Error("provider failure");
    },
  });

  console.error = originalConsoleError;

  assert.equal(analysis.recommendedType, "bug");
  assert.equal(analysis.priority, "critical");
  assert.equal(analysis.suspectedDuplicateTicketId, duplicateCandidates[0]?.id);
});

test("resolveTicketAnalysis uses heuristic analysis when no generator is provided", async () => {
  const analysis = await resolveTicketAnalysis({
    ticket: {
      ...baseTicket,
      type: "suggestion",
      title: "Could you add CSV export",
      description: "We would like a CSV export for weekly payroll reports.",
    },
    rankedCandidates: [],
  });

  assert.equal(analysis.recommendedType, "suggestion");
  assert.equal(analysis.priority, "low");
  assert.equal(analysis.suspectedDuplicateTicketId, null);
});

test("parseProviderTicketAnalysis coerces alternate provider field names", () => {
  const analysis = parseProviderTicketAnalysis(
    '{"priority":"low","type":"bug","duplicate_of":null,"reason":"Placeholder text shows no clear business impact."}',
  );

  assert.equal(analysis.priority, "low");
  assert.equal(analysis.recommendedType, "bug");
  assert.equal(analysis.suspectedDuplicateTicketId, null);
  assert.equal(analysis.sentiment, "neutral");
  assert.equal(analysis.technicalImpact, "low");
  assert.equal(analysis.duplicateSignals.length, 0);
});

test("parseProviderTicketAnalysis coerces string confidence and impact variants", () => {
  const analysis = parseProviderTicketAnalysis(
    '{"priority":"low","recommendedType":"bug","recommendedTypeConfidence":"77","typeReason":"Looks like a bug report.","priorityReason":"Low impact placeholder text.","sentiment":"neutral","technicalImpact":"minor","duplicateReason":null,"duplicateScore":null,"duplicateSignals":[],"suspectedDuplicateTicketId":null}',
  );

  assert.equal(analysis.recommendedTypeConfidence, 77);
  assert.equal(analysis.technicalImpact, "low");
  assert.equal(analysis.recommendedType, "bug");
});

test("parseProviderTicketAnalysis normalizes loose sentiment labels", () => {
  const analysis = parseProviderTicketAnalysis(
    '{"priority":"high","recommendedType":"bug","recommendedTypeConfidence":88,"typeReason":"Users are blocked.","priorityReason":"This blocks payroll processing.","sentiment":"frustrated","technicalImpact":"major","duplicateReason":null,"duplicateScore":null,"duplicateSignals":[],"suspectedDuplicateTicketId":null}',
  );

  assert.equal(analysis.sentiment, "negative");
  assert.equal(analysis.technicalImpact, "high");
});
