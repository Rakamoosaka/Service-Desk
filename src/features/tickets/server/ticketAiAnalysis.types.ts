export type TicketForAnalysis = {
  type: "feedback" | "suggestion" | "bug";
  title: string;
  description: string;
  serviceId: string | null;
  application: {
    name: string;
    slug: string;
  };
  service: {
    name: string;
  } | null;
};

export type TicketDuplicateCandidate = {
  id: string;
  title: string;
  description: string;
  type: "feedback" | "suggestion" | "bug";
  status: "new" | "in_review" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical" | "unknown";
  serviceId: string | null;
};

export type RankedTicketDuplicateCandidate = TicketDuplicateCandidate & {
  rankScore: number;
};

export type TicketImpact = "low" | "medium" | "high" | "critical";
export type TicketSentiment = "negative" | "neutral" | "positive";
