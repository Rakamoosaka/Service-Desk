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
      return "border-[#ff2244]/30 bg-[#2a1118] text-[#ffb8c3]";
    case "high":
      return "border-[#ff8a3d]/30 bg-[#2b1b10] text-[#ffc296]";
    case "medium":
      return "border-white/12 bg-white/[0.03] text-[#d5dde1]";
    case "low":
      return "border-[#6fd9c4]/25 bg-[#0f201d] text-[#9fe9db]";
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
      return "border-[#ff2244]/20 bg-[#ff2244]/10 text-[#ff9aaa]";
    case "suggestion":
      return "border-[#43b5ff]/22 bg-[#102638] text-[#8fd8ff]";
    default:
      return "border-[#4fcf8d]/22 bg-[#11261b] text-[#9ce8c1]";
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
