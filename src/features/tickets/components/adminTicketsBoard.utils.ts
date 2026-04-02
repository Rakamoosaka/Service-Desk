import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";
import type { TicketRecord } from "@/features/tickets/components/adminTicketsBoard.types";

export const ticketStatusOptions: Array<{
  value: TicketRecord["status"];
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const ticketPriorityOptions: Array<{
  value: TicketRecord["priority"];
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
  { value: "unknown", label: "Unknown" },
];

export function statusSelectClassName(status: TicketRecord["status"]) {
  switch (status) {
    case "new":
      return "border-info/40 bg-info/10 text-info";
    case "in_review":
      return "border-warning/40 bg-warning/10 text-warning";
    case "resolved":
      return "border-accent/40 bg-accent/10 text-accent";
    default:
      return "border-border bg-input text-muted-foreground";
  }
}

export function prioritySelectClassName(priority: TicketRecord["priority"]) {
  switch (priority) {
    case "critical":
      return "border-destructive/30 bg-destructive/12 text-destructive";
    case "high":
      return "border-warning/30 bg-warning/12 text-warning";
    case "medium":
      return "border-border bg-muted/45 text-foreground";
    case "low":
      return "border-accent/25 bg-accent/12 text-accent";
    default:
      return "border-border bg-input text-muted-foreground";
  }
}

export function buildTicketSearchParams(filters: TicketFilters) {
  const params = new URLSearchParams();

  if (filters.appId) params.set("appId", filters.appId);
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.search) params.set("search", filters.search);

  return params;
}

export function sentenceCase(value: string) {
  return value.replace(/_/g, " ");
}

export function typeTagClassName(type: TicketRecord["type"]) {
  switch (type) {
    case "bug":
      return "border-destructive/25 bg-destructive/10 text-destructive";
    case "suggestion":
      return "border-info/25 bg-info/10 text-info";
    default:
      return "border-accent/25 bg-accent/10 text-accent";
  }
}

export function typeTagDotClassName(type: TicketRecord["type"]) {
  switch (type) {
    case "bug":
      return "bg-[#ff5a72]";
    case "suggestion":
      return "bg-[#61c5ff]";
    default:
      return "bg-[#61d89d]";
  }
}

export function formatTypeLabel(type: TicketRecord["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatBulkUpdateToastLabel(value: string) {
  return sentenceCase(value);
}
