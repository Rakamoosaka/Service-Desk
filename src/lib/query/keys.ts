import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";

export const queryKeys = {
  applications: ["applications"] as const,
  tickets: (filters: TicketFilters) => ["tickets", filters] as const,
  users: ["users"] as const,
};
