"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
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
import { InfoTooltip } from "@/components/ui/InfoTooltip";
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

function statusSelectClassName(status: TicketRecord["status"]) {
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
    return "needs review";
  }

  if (ticket.aiSuggestionStatus === "accepted") {
    return "reviewed";
  }

  if (ticket.aiSuggestionStatus === "dismissed") {
    return "kept current";
  }

  if (ticket.analysisState === "pending") {
    return "analysis pending";
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
      action:
        | "accept"
        | "dismiss"
        | "accept_type"
        | "dismiss_type"
        | "clear_duplicate"
        | "clear_all_duplicates";
    }) =>
      fetchJson(`/api/tickets/${id}/ai-review`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (_, variables) => {
      const messageByAction = {
        accept: "Suggestions applied",
        dismiss: "Suggestions dismissed",
        accept_type: "Lane change applied",
        dismiss_type: "Lane change dismissed",
        clear_duplicate: "Duplicate reminder removed",
        clear_all_duplicates: "All duplicate reminders removed",
      } as const;

      toast.success(messageByAction[variables.action]);
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
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.4fr_0.4fr_auto]">
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
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="h-11 w-11 px-0"
              >
                <a
                  href={exportHref}
                  aria-label="Download CSV"
                  title="Download CSV"
                >
                  <Download className="size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          <div className="border-border overflow-x-auto overflow-y-hidden rounded-[18px] border">
            <div className="min-w-full">
              <table className="divide-border w-full min-w-245 divide-y text-left text-[13px]">
                <thead className="bg-muted/70 text-muted-foreground">
                  <tr>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Ticket
                    </th>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Application
                    </th>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Submitted by
                    </th>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Type
                    </th>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Priority
                    </th>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Status
                    </th>
                    <th className="px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Created
                    </th>
                    <th className="w-14 p-0" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody className="divide-border bg-panel divide-y">
                  {ticketsQuery.data?.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/2">
                      <td className="px-3.5 py-3.5 align-top">
                        <div className="relative inline-flex max-w-[19ch] min-w-0 items-start sm:max-w-[24ch] lg:max-w-[29ch]">
                          {ticket.suspectedDuplicateTicketId ? (
                            <TicketDuplicateIndicator className="absolute -top-2.5 -left-2.5" />
                          ) : null}
                          <p className="truncate font-semibold text-white">
                            {ticket.title}
                          </p>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-3.5 py-3.5 align-top">
                        {ticket.application.name}
                      </td>
                      <td className="px-3.5 py-3.5 align-top">
                        <p>{ticket.submittedBy.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {ticket.submittedBy.email}
                        </p>
                      </td>
                      <td className="px-3.5 py-3.5 align-top">
                        <Badge tone="accent">{ticket.type}</Badge>
                      </td>
                      <td className="px-3.5 py-3.5 align-top">
                        <Badge tone="neutral">{ticket.priority}</Badge>
                      </td>
                      <td className="px-3.5 py-3.5 align-top">
                        <Select
                          className={`min-w-32 font-medium ${statusSelectClassName(ticket.status)}`}
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
                      </td>
                      <td className="text-muted-foreground px-3.5 py-3.5 align-top">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="w-14 px-2 py-3.5 align-middle">
                        <Button
                          size="sm"
                          variant={
                            ticket.aiSuggestionStatus === "pending_review"
                              ? "primary"
                              : "secondary"
                          }
                          className="h-9 w-9 rounded-full px-0"
                          aria-label="Review ticket triage"
                          title="Review ticket triage"
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <Search className="size-4" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        <DialogContent className="max-h-[88vh] w-[min(92vw,760px)] overflow-y-auto rounded-[18px] p-0 shadow-none">
          {selectedTicket ? (
            <div className="flex flex-col">
              <div className="border-border/70 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
                <DialogHeader className="max-w-3xl">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                    Ticket review
                  </p>
                  <DialogTitle className="text-[1.65rem] md:text-[1.9rem]">
                    Triage review
                  </DialogTitle>
                  <DialogDescription className="text-[13px] leading-6 md:text-sm md:leading-6">
                    Review the suggested lane changes and duplicate flags before
                    updating the queue.
                  </DialogDescription>
                </DialogHeader>

                <DialogDismissButton
                  onClick={() => setSelectedTicketId(null)}
                />
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
                <div className="border-border bg-muted/30 rounded-[18px] border p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{selectedTicket.priority}</Badge>
                    <Badge tone={aiStatusTone(selectedTicket)}>
                      {aiStatusLabel(selectedTicket)}
                    </Badge>
                    {selectedTicket.suspectedDuplicateTicketId ? (
                      <Badge tone="warning">duplicate flag</Badge>
                    ) : null}
                  </div>
                  <p className="text-foreground mt-4 font-semibold">
                    {selectedTicket.title}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-7">
                    {selectedTicket.aiTriage.priorityReason ??
                      "Priority could not be scored because analysis has not completed yet."}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] md:items-start">
                  <div className="border-border bg-muted/30 self-start rounded-[18px] border p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                          Lane recommendation
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                          Review the current lane against the suggested update.
                        </p>
                      </div>
                      <InfoTooltip
                        content="This panel compares the current lane with the suggested one. Accept applies the suggested lane, and dismiss keeps the current lane unchanged."
                        label="Lane recommendation help"
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                          Current lane
                        </span>
                        <Badge tone="neutral">
                          {sentenceCase(selectedTicket.type)}
                        </Badge>
                      </div>

                      <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                          Suggested lane
                        </span>
                        <Badge tone="accent">
                          {sentenceCase(
                            selectedTicket.aiTriage.recommendedType ??
                              selectedTicket.type,
                          )}
                        </Badge>
                      </div>

                      <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                          Confidence
                        </span>
                        <span className="text-foreground text-sm font-semibold">
                          {selectedTicket.aiTriage.recommendedTypeConfidence
                            ? `${Math.round(selectedTicket.aiTriage.recommendedTypeConfidence)}%`
                            : "n/a"}
                        </span>
                      </div>
                    </div>

                    <div className="border-border/70 bg-panel/35 mt-4 rounded-2xl border px-3.5 py-3.5">
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                        Why this was suggested
                      </p>
                      <p className="text-foreground/88 mt-2 text-sm leading-6">
                        {selectedTicket.aiTriage.typeReason ??
                          "No category change was suggested for this ticket."}
                      </p>
                    </div>

                    {selectedTicket.aiSuggestionStatus === "pending_review" ? (
                      <div className="mt-4 flex justify-end gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            reviewMutation.mutate({
                              id: selectedTicket.id,
                              action: "dismiss_type",
                            })
                          }
                        >
                          Dismiss lane change
                        </Button>
                        <Button
                          size="sm"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            reviewMutation.mutate({
                              id: selectedTicket.id,
                              action: "accept_type",
                            })
                          }
                        >
                          Accept lane change
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="border-border bg-muted/30 rounded-[18px] border p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                          Extra context
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                          Supporting signals for the review decision.
                        </p>
                      </div>
                      <InfoTooltip
                        content="These values are reference only. They do not change the ticket by themselves. This review can approve a lane change and keep or dismiss a duplicate reminder; priority was already set at creation."
                        label="Extra context help"
                        align="right"
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                          User sentiment
                        </span>
                        <Badge tone="neutral">
                          {sentenceCase(
                            selectedTicket.aiTriage.sentiment ?? "n/a",
                          )}
                        </Badge>
                      </div>

                      <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                          Service impact
                        </span>
                        <Badge tone="neutral">
                          {sentenceCase(
                            selectedTicket.aiTriage.technicalImpact ?? "n/a",
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-border bg-muted/30 rounded-[18px] border p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                        Duplicate review
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        Review duplicate reminders individually.
                      </p>
                    </div>

                    {selectedTicket.suspectedDuplicateTicket &&
                    selectedTicket.aiSuggestionStatus === "pending_review" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({
                            id: selectedTicket.id,
                            action: "clear_all_duplicates",
                          })
                        }
                      >
                        Delete all
                      </Button>
                    ) : null}
                  </div>

                  {selectedTicket.suspectedDuplicateTicket ? (
                    <ul className="mt-4 space-y-3">
                      <li className="border-border/70 bg-panel/35 rounded-2xl border px-4 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone="warning">
                                {selectedTicket.aiTriage.duplicateScore
                                  ? `${Math.round(selectedTicket.aiTriage.duplicateScore)}% match`
                                  : "possible duplicate"}
                              </Badge>
                              <Badge tone="neutral">
                                {sentenceCase(
                                  selectedTicket.suspectedDuplicateTicket
                                    .status,
                                )}
                              </Badge>
                            </div>

                            <p className="text-foreground font-semibold">
                              {selectedTicket.suspectedDuplicateTicket.title}
                            </p>

                            <p className="text-muted-foreground text-sm leading-7">
                              {selectedTicket.aiTriage.duplicateReason ??
                                "This ticket appears related to an earlier item in the queue."}
                            </p>

                            {selectedTicket.aiTriage.duplicateSignals
                              ?.length ? (
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

                          {selectedTicket.aiSuggestionStatus ===
                          "pending_review" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="shrink-0"
                              disabled={reviewMutation.isPending}
                              onClick={() =>
                                reviewMutation.mutate({
                                  id: selectedTicket.id,
                                  action: "clear_duplicate",
                                })
                              }
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    </ul>
                  ) : (
                    <p className="text-muted-foreground mt-4 text-sm leading-7">
                      No strong duplicate match was found for this ticket.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm leading-7">
                    {selectedTicket.aiSuggestionStatus === "pending_review"
                      ? "Use the action inside Lane recommendation to apply the lane change, and manage duplicate reminders from the list above."
                      : "No pending suggestion changes are waiting for review on this ticket."}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedTicketId(null)}
                    >
                      Close
                    </Button>
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
