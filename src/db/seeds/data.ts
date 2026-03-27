export const seedUsers = [
  {
    id: "seed-admin-1",
    name: "Avery Admin",
    email: "admin@example.com",
    role: "admin" as const,
    gitlabUserId: "123456",
  },
  {
    id: "seed-user-1",
    name: "Morgan User",
    email: "morgan@example.com",
    role: "user" as const,
    gitlabUserId: "654321",
  },
];

export const seedApplications = [
  {
    name: "Atlas CRM",
    slug: "atlas-crm",
    description:
      "Customer relationship workflows for sales and support handoffs.",
  },
  {
    name: "Beacon Payroll",
    slug: "beacon-payroll",
    description: "Internal payroll approvals, reports, and export operations.",
  },
  {
    name: "Relay Docs",
    slug: "relay-docs",
    description: "Knowledge publishing and controlled internal documentation.",
  },
];

export const seedServices = [
  {
    applicationSlug: "atlas-crm",
    name: "Handoff API",
    slug: "handoff-api",
    description: "Owns sales-to-support customer handoffs and attachment sync.",
    uptimeKumaIdentifier: "test-task",
  },
  {
    applicationSlug: "atlas-crm",
    name: "Pipeline Worker",
    slug: "pipeline-worker",
    description:
      "Processes background CRM enrichment and pipeline transitions.",
    uptimeKumaIdentifier: "test-task",
  },
  {
    applicationSlug: "beacon-payroll",
    name: "Approvals API",
    slug: "approvals-api",
    description:
      "Handles payroll approval flows, audit gates, and reporting triggers.",
    uptimeKumaIdentifier: "test-task",
  },
  {
    applicationSlug: "relay-docs",
    name: "Publishing API",
    slug: "publishing-api",
    description:
      "Publishes approved documents and serves internal content revisions.",
    uptimeKumaIdentifier: "test-task",
  },
];

export const seedTickets = [
  {
    applicationSlug: "atlas-crm",
    serviceSlug: "handoff-api",
    type: "bug" as const,
    title: "Pipeline sync stalls on handoff",
    description:
      "The CRM handoff step freezes when a large customer record is attached.",
    status: "new" as const,
    priority: "high" as const,
  },
  {
    applicationSlug: "beacon-payroll",
    serviceSlug: "approvals-api",
    type: "suggestion" as const,
    title: "Add CSV preview before export",
    description:
      "Payroll exports would be safer if admins could preview row counts before confirming.",
    status: "in_review" as const,
    priority: "medium" as const,
  },
  {
    applicationSlug: "relay-docs",
    serviceSlug: "publishing-api",
    type: "feedback" as const,
    title: "Publishing flow is clear",
    description:
      "The new docs editor feels much faster and the section labels are easier to scan.",
    status: "resolved" as const,
    priority: "low" as const,
  },
];
