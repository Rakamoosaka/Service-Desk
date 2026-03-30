"use client";

import { useDeferredValue, useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";
import type { StoredTicketAiTriage } from "@/features/tickets/ticketAi";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TicketDuplicateIndicator } from "@/features/tickets/components/TicketDuplicateIndicator";

type TicketRecord = {
  id: string;
  title: string;
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

interface AdminTicketsBoardProps {
  initialTickets: TicketRecord[];
  applications: Array<{
    id: string;
    name: string;
  }>;
}

function toTone(status: TicketRecord["status"]) {
  switch (status) {
    case "new":
      return "info" as const;
    case "in_review":
      return "warning" as const;
    case "resolved":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

function buildTicketSearchParams(filters: TicketFilters) {
  const params = new URLSearchParams();

  if (filters.appId) params.set("appId", filters.appId);
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.search) params.set("search", filters.search);

  return params;
}

function aiStatusTone(ticket: TicketRecord) {
  if (ticket.aiSuggestionStatus === "pending_review") {
    return "warning" as const;
  }

  if (ticket.analysisState === "completed") {
    return "success" as const;
  }

  if (ticket.analysisState === "failed") {
    return "danger" as const;
  }

  return "neutral" as const;
}

function aiStatusLabel(ticket: TicketRecord) {
  if (ticket.aiSuggestionStatus === "pending_review") {
    return "review pending";
  }

  if (ticket.aiSuggestionStatus === "accepted") {
    return "accepted";
  }

  if (ticket.aiSuggestionStatus === "dismissed") {
    return "dismissed";
  }

  if (ticket.analysisState === "pending") {
    return "analyzing";
  }

  if (ticket.analysisState === "failed") {
    return "analysis failed";
  }

  if (ticket.analysisState === "completed") {
    return "no changes";
  }

  return "not configured";
}

function sentenceCase(value: string) {
  return value.replace(/_/g, " ");
}

export function AdminTicketsBoard({
  initialTickets,
  applications,
}: AdminTicketsBoardProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(filters.search);
  const activeFilters = { ...filters, search: deferredSearch };
  const exportParams = buildTicketSearchParams(activeFilters).toString();
  const exportHref = exportParams
    ? `/api/tickets/export?${exportParams}`
    : "/api/tickets/export";

  const ticketsQuery = useQuery({
    queryKey: queryKeys.tickets(activeFilters),
    queryFn: async () => {
      const params = buildTicketSearchParams(activeFilters);

      return fetchJson<TicketRecord[]>(`/api/tickets?${params.toString()}`);
    },
    initialData:
      !activeFilters.appId &&
      !activeFilters.status &&
      !activeFilters.type &&
      !activeFilters.search
        ? initialTickets
        : undefined,
  });
  const selectedTicket =
    ticketsQuery.data?.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: Pick<TicketRecord, "id" | "status">) =>
      fetchJson(`/api/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets(activeFilters),
      });
      const previous = queryClient.getQueryData<TicketRecord[]>(
        queryKeys.tickets(activeFilters),
      );

      queryClient.setQueryData<TicketRecord[]>(
        queryKeys.tickets(activeFilters),
        (current) =>
          current?.map((ticket) =>
            ticket.id === id ? { ...ticket, status } : ticket,
          ) ?? [],
      );

      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.tickets(activeFilters),
          context.previous,
        );
      }

      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Ticket status updated");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tickets(activeFilters),
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "accept" | "dismiss";
    }) =>
      fetchJson(`/api/tickets/${id}/ai-review`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === "accept"
          ? "AI suggestions accepted"
          : "AI suggestions dismissed",
      );
      setSelectedTicketId(null);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tickets(activeFilters),
      });
    },
  });

  return (
    <>
      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.4fr_0.4fr]">
              <Input
                placeholder="Search title or description"
                value={filters.search ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value || undefined,
                  }))
                }
              />
              <Select
                value={filters.appId ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    appId: event.target.value || undefined,
                  }))
                }
              >
                <option value="">All applications</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.name}
                  </option>
                ))}
              </Select>
              <Select
                value={filters.status ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status:
                      (event.target.value as TicketFilters["status"]) ||
                      undefined,
                  }))
                }
              >
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="in_review">In review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
              <Select
                value={filters.type ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    type:
                      (event.target.value as TicketFilters["type"]) ||
                      undefined,
                  }))
                }
              >
                <option value="">All types</option>
                <option value="feedback">Feedback</option>
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug</option>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button asChild size="sm" variant="secondary">
                <a href={exportHref}>Download CSV</a>
              </Button>
            </div>
          </div>

          <div className="border-border overflow-hidden rounded-[20px] border">
            <table className="divide-border min-w-full divide-y text-left text-sm">
              <thead className="bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Application
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Submitted by
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Operations
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border bg-panel divide-y">
                {ticketsQuery.data?.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/2">
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative inline-flex max-w-full items-start">
                            {ticket.suspectedDuplicateTicketId ? (
                              <TicketDuplicateIndicator className="absolute -top-2.5 -left-2.5" />
                            ) : null}
                            <p className="font-semibold text-white">
                              {ticket.title}
                            </p>
                          </div>
                          <Badge tone="accent">{ticket.type}</Badge>
                          <Badge tone="neutral">{ticket.priority}</Badge>
                          <Badge tone={aiStatusTone(ticket)}>
                            {aiStatusLabel(ticket)}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-4 align-top">
                      {ticket.application.name}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>{ticket.submittedBy.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {ticket.submittedBy.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <Badge tone={toTone(ticket.status)}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                        <Select
                          className="min-w-36"
                          value={ticket.status}
                          onChange={(event) =>
                            updateStatusMutation.mutate({
                              id: ticket.id,
                              status: event.target
                                .value as TicketRecord["status"],
                            })
                          }
                        >
                          <option value="new">New</option>
                          <option value="in_review">In review</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Button
                        size="sm"
                        variant={
                          ticket.aiSuggestionStatus === "pending_review"
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <BrainCircuit className="size-4" />
                        AI triage
                      </Button>
                    </td>
                    <td className="text-muted-foreground px-4 py-4 align-top">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedTicket)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketId(null);
          }
        }}
      >
        <DialogContent className="max-h-[88vh] w-[min(92vw,760px)] overflow-y-auto rounded-[18px] border-white/12 bg-[linear-gradient(180deg,rgba(8,12,16,0.995),rgba(8,12,16,0.985))] p-0 shadow-none [&_.panel-grid]:hidden">
          {selectedTicket ? (
            <div className="flex flex-col">
              <div className="border-border/70 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
                <DialogHeader className="max-w-3xl">
                  <p className="text-accent text-[11px] font-semibold tracking-[0.3em] uppercase">
                    Ticket operations
                  </p>
                  <DialogTitle className="text-[1.9rem] md:text-[2.15rem]">
                    AI triage review
                  </DialogTitle>
                  <DialogDescription className="text-[13px] leading-6 md:text-sm md:leading-6">
                    Review the suggested category changes and duplicate signals
                    before applying them to the queue.
                  </DialogDescription>
                </DialogHeader>

                <DialogDismissButton
                  onClick={() => setSelectedTicketId(null)}
                />
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{selectedTicket.priority}</Badge>
                    <Badge tone={aiStatusTone(selectedTicket)}>
                      {aiStatusLabel(selectedTicket)}
                    </Badge>
                    {selectedTicket.suspectedDuplicateTicketId ? (
                      <Badge tone="warning">duplicate flag</Badge>
                    ) : null}
                  </div>
                  <p className="mt-4 font-semibold text-white">
                    {selectedTicket.title}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-7">
                    {selectedTicket.aiTriage.priorityReason ??
                      "Priority could not be scored because AI triage has not completed yet."}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Lane recommendation
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">
                        current: {selectedTicket.type}
                      </Badge>
                      <Badge tone="accent">
                        suggested:{" "}
                        {selectedTicket.aiTriage.recommendedType ??
                          selectedTicket.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm leading-7">
                      {selectedTicket.aiTriage.typeReason ??
                        "No category change was suggested for this ticket."}
                    </p>
                    {selectedTicket.aiTriage.recommendedTypeConfidence ? (
                      <p className="text-muted-foreground/85 mt-3 text-xs tracking-[0.18em] uppercase">
                        Confidence{" "}
                        {Math.round(
                          selectedTicket.aiTriage.recommendedTypeConfidence,
                        )}
                        %
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Technical read
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">
                        sentiment: {selectedTicket.aiTriage.sentiment ?? "n/a"}
                      </Badge>
                      <Badge tone="neutral">
                        impact:{" "}
                        {selectedTicket.aiTriage.technicalImpact ?? "n/a"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm leading-7">
                      Priority is applied automatically on create. This review
                      only controls lane changes and duplicate reminders.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-warning size-4" />
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Duplicate analysis
                    </p>
                  </div>

                  {selectedTicket.suspectedDuplicateTicket ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="warning">
                          {selectedTicket.aiTriage.duplicateScore
                            ? `${Math.round(selectedTicket.aiTriage.duplicateScore)}% match`
                            : "possible duplicate"}
                        </Badge>
                        <Badge tone="neutral">
                          {sentenceCase(
                            selectedTicket.suspectedDuplicateTicket.status,
                          )}
                        </Badge>
                      </div>
                      <p className="font-semibold text-white">
                        {selectedTicket.suspectedDuplicateTicket.title}
                      </p>
                      <p className="text-muted-foreground text-sm leading-7">
                        {selectedTicket.aiTriage.duplicateReason ??
                          "AI linked this ticket to an earlier item in the queue."}
                      </p>
                      {selectedTicket.aiTriage.duplicateSignals?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.aiTriage.duplicateSignals.map(
                            (signal) => (
                              <Badge key={signal} tone="neutral">
                                {signal}
                              </Badge>
                            ),
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-4 text-sm leading-7">
                      No strong duplicate match was found for this ticket.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm leading-7">
                    {selectedTicket.aiSuggestionStatus === "pending_review"
                      ? "Accept to apply the suggested lane and keep the duplicate reminder. Dismiss to keep the current lane and remove the duplicate reminder."
                      : "No pending AI changes are waiting for review on this ticket."}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {selectedTicket.aiSuggestionStatus === "pending_review" ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            reviewMutation.mutate({
                              id: selectedTicket.id,
                              action: "dismiss",
                            })
                          }
                        >
                          Dismiss suggestions
                        </Button>
                        <Button
                          size="sm"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            reviewMutation.mutate({
                              id: selectedTicket.id,
                              action: "accept",
                            })
                          }
                        >
                          Accept suggestions
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedTicketId(null)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
