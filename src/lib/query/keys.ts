import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";

export const queryKeys = {
  applications: ["applications"] as const,
  services: ["services"] as const,
  tickets: (filters: TicketFilters) => ["tickets", filters] as const,
  uptime: (applicationSlug: string, serviceSlug: string) =>
    ["uptime", applicationSlug, serviceSlug] as const,
  users: ["users"] as const,
};
