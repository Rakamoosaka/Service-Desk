"use client";

import { Bug, Lightbulb, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import type { TicketInput } from "@/features/tickets/schemas/ticketSchemas";

export const typeOptions: Array<{
  value: TicketInput["type"];
  label: string;
  summary: string;
}> = [
  {
    value: "feedback",
    label: "Feedback",
    summary: "Share what is working well or what feels rough around the edges.",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    summary: "Request a workflow improvement or a missing capability.",
  },
  {
    value: "bug",
    label: "Bug",
    summary: "Report a broken flow, unexpected behavior, or runtime defect.",
  },
];

export interface TicketIntakeFormProps {
  applicationId: string;
  services?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  defaultServiceId?: string;
  fixedType?: TicketInput["type"];
  eyebrow?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  titleLabel?: string;
  titlePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  serviceLabel?: string;
  serviceHelpText?: string;
  submitButtonClassName?: string;
  className?: string;
  compact?: boolean;
  headerAddon?: ReactNode;
  hideTypeBadge?: boolean;
  onSuccess?: () => void;
}

export function ticketTypeTone(type: TicketInput["type"]) {
  switch (type) {
    case "bug":
      return "danger" as const;
    case "suggestion":
      return "accent" as const;
    default:
      return "info" as const;
  }
}

export function ticketTypeCardClass(type: TicketInput["type"]) {
  switch (type) {
    case "bug":
      return "border-destructive/35";
    case "suggestion":
      return "border-accent/35";
    default:
      return "border-info/30";
  }
}

export function TicketTypeIcon({ type }: { type: TicketInput["type"] }) {
  switch (type) {
    case "bug":
      return <Bug className="size-4" />;
    case "suggestion":
      return <Lightbulb className="size-4" />;
    default:
      return <MessageSquare className="size-4" />;
  }
}

export function TicketTypeBadge({
  type,
  compact,
}: {
  type: TicketInput["type"];
  compact: boolean;
}) {
  return (
    <Badge
      tone={ticketTypeTone(type)}
      className={compact ? "text-[11px] shadow-none" : "shadow-none"}
    >
      {type}
    </Badge>
  );
}
