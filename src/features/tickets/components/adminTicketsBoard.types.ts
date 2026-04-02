import type { StoredTicketAiTriage } from "@/features/tickets/ticketAi";

export type TicketRecord = {
  id: string;
  title: string;
  description: string;
  type: "feedback" | "suggestion" | "bug";
  status: "new" | "in_review" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical" | "unknown";
  analysisState: "not_requested" | "pending" | "completed" | "failed";
  aiSuggestionStatus: "none" | "pending_review" | "accepted" | "dismissed";
  aiTriage: StoredTicketAiTriage;
  suspectedDuplicateTicketId: string | null;
  suspectedDuplicateTicket: {
    id: string;
    title: string;
    type: "feedback" | "suggestion" | "bug";
    status: "new" | "in_review" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "critical" | "unknown";
    createdAt: string;
  } | null;
  createdAt: string;
  application: {
    id: string;
    name: string;
    slug: string;
  };
  submittedBy: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
  };
};

export type TicketReviewAction =
  | "accept"
  | "dismiss"
  | "accept_type"
  | "dismiss_type"
  | "clear_duplicate"
  | "clear_all_duplicates";
