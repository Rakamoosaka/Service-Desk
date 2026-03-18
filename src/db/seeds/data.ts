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
    uptimeKumaIdentifier: "atlas-crm",
  },
  {
    name: "Beacon Payroll",
    slug: "beacon-payroll",
    description: "Internal payroll approvals, reports, and export operations.",
    uptimeKumaIdentifier: "beacon-payroll",
  },
  {
    name: "Relay Docs",
    slug: "relay-docs",
    description: "Knowledge publishing and controlled internal documentation.",
    uptimeKumaIdentifier: "relay-docs",
  },
];

export const seedTickets = [
  {
    type: "bug" as const,
    title: "Pipeline sync stalls on handoff",
    description:
      "The CRM handoff step freezes when a large customer record is attached.",
    status: "new" as const,
    priority: "high" as const,
  },
  {
    type: "suggestion" as const,
    title: "Add CSV preview before export",
    description:
      "Payroll exports would be safer if admins could preview row counts before confirming.",
    status: "in_review" as const,
    priority: "medium" as const,
  },
  {
    type: "feedback" as const,
    title: "Publishing flow is clear",
    description:
      "The new docs editor feels much faster and the section labels are easier to scan.",
    status: "resolved" as const,
    priority: "low" as const,
  },
];
