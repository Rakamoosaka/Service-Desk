"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTicketsBoardToolbar } from "@/features/tickets/components/AdminTicketsBoardToolbar";
import { AdminTicketsTable } from "@/features/tickets/components/AdminTicketsTable";
import { TicketResponseDialog } from "@/features/tickets/components/TicketResponseDialog";
import type {
  BulkTicketUpdateInput,
  TicketFilters,
} from "@/features/tickets/schemas/ticketSchemas";
import { TicketAiReviewDialog } from "./TicketAiReviewDialog";
import type {
  TicketRecord,
  TicketReviewAction,
} from "@/features/tickets/components/adminTicketsBoard.types";
import {
  buildTicketSearchParams,
  formatBulkUpdateToastLabel,
} from "@/features/tickets/components/adminTicketsBoard.utils";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import {
  optimisticQueryUpdate,
  rollbackOptimisticQueryUpdate,
} from "@/lib/query/optimistic";
import { Card, CardContent } from "@/components/ui/Card";

interface AdminTicketsBoardProps {
  initialTickets: TicketRecord[];
  applications: Array<{
    id: string;
    name: string;
  }>;
}

export function AdminTicketsBoard({
  initialTickets,
  applications,
}: AdminTicketsBoardProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [responseTicketId, setResponseTicketId] = useState<string | null>(null);
  const [aiReviewTicketId, setAiReviewTicketId] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [bulkStatus, setBulkStatus] = useState<"" | TicketRecord["status"]>("");
  const [bulkPriority, setBulkPriority] = useState<
    "" | TicketRecord["priority"]
  >("");
  const deferredSearch = useDeferredValue(filters.search);
  const activeFilters = { ...filters, search: deferredSearch };
  const exportParams = buildTicketSearchParams(activeFilters).toString();
  const exportHref = exportParams
    ? `/api/tickets/export?${exportParams}`
    : "/api/tickets/export";
  const ticketsQueryKey = queryKeys.tickets(activeFilters);

  const ticketsQuery = useQuery({
    queryKey: ticketsQueryKey,
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
  const responseTicket =
    ticketsQuery.data?.find((ticket) => ticket.id === responseTicketId) ?? null;
  const aiReviewTicket =
    ticketsQuery.data?.find((ticket) => ticket.id === aiReviewTicketId) ?? null;
  const visibleTicketIds = ticketsQuery.data?.map((ticket) => ticket.id) ?? [];
  const visibleTicketIdSet = new Set(visibleTicketIds);
  const selectedVisibleTicketIds = selectedTicketIds.filter((ticketId) =>
    visibleTicketIdSet.has(ticketId),
  );
  const selectedTicketIdSet = new Set(selectedVisibleTicketIds);
  const selectedCount = selectedVisibleTicketIds.length;
  const hasVisibleTickets = visibleTicketIds.length > 0;
  const tickets = ticketsQuery.data ?? [];
  const allVisibleSelected =
    hasVisibleTickets &&
    visibleTicketIds.every((ticketId) => selectedTicketIdSet.has(ticketId));

  function setFilter<Key extends keyof TicketFilters>(
    key: Key,
    value: TicketFilters[Key] | undefined,
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function closeResponseDialog() {
    setResponseMessage("");
    setResponseTicketId(null);
  }

  function closeAiReviewDialog() {
    setAiReviewTicketId(null);
  }

  function toggleTicketSelection(ticketId: string, checked: boolean) {
    setSelectedTicketIds((current) => {
      if (checked) {
        return current.includes(ticketId) ? current : [...current, ticketId];
      }

      return current.filter((value) => value !== ticketId);
    });
  }

  function toggleAllVisibleTickets(checked: boolean) {
    setSelectedTicketIds(checked ? visibleTicketIds : []);
  }

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: Pick<TicketRecord, "id" | "status">) =>
      fetchJson(`/api/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onMutate: ({ id, status }) =>
      optimisticQueryUpdate<TicketRecord[]>({
        queryClient,
        queryKey: ticketsQueryKey,
        updater: (current) =>
          current?.map((ticket) =>
            ticket.id === id ? { ...ticket, status } : ticket,
          ) ?? [],
      }),
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: ticketsQueryKey,
        context,
      });

      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Ticket status updated");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ticketsQueryKey,
      });
    },
  });

  const sendResponseMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) =>
      fetchJson<{ success: true }>(`/api/tickets/${id}/respond`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Ticket response emailed");
      setResponseMessage("");
      setResponseTicketId(null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: TicketReviewAction;
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

  const updatePriorityMutation = useMutation({
    mutationFn: async ({
      id,
      priority,
    }: Pick<TicketRecord, "id" | "priority">) =>
      fetchJson(`/api/tickets/${id}/priority`, {
        method: "PATCH",
        body: JSON.stringify({ priority }),
      }),
    onMutate: ({ id, priority }) =>
      optimisticQueryUpdate<TicketRecord[]>({
        queryClient,
        queryKey: ticketsQueryKey,
        updater: (current) =>
          current?.map((ticket) =>
            ticket.id === id ? { ...ticket, priority } : ticket,
          ) ?? [],
      }),
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: ticketsQueryKey,
        context,
      });

      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Ticket priority updated");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ticketsQueryKey,
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (payload: BulkTicketUpdateInput) =>
      fetchJson<{ updatedCount: number }>("/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onMutate: (payload) =>
      optimisticQueryUpdate<TicketRecord[]>({
        queryClient,
        queryKey: ticketsQueryKey,
        updater: (current) =>
          current?.map((ticket) => {
            if (!payload.ids.includes(ticket.id)) {
              return ticket;
            }

            return {
              ...ticket,
              ...(payload.status ? { status: payload.status } : null),
              ...(payload.priority ? { priority: payload.priority } : null),
            };
          }) ?? [],
      }),
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: ticketsQueryKey,
        context,
      });

      toast.error(error.message);
    },
    onSuccess: (response, variables) => {
      setSelectedTicketIds([]);

      if (variables.status) {
        setBulkStatus("");
        toast.success(
          `${response.updatedCount} ticket${response.updatedCount === 1 ? "" : "s"} moved to ${formatBulkUpdateToastLabel(variables.status)}`,
        );
        return;
      }

      setBulkPriority("");
      toast.success(
        `${response.updatedCount} ticket${response.updatedCount === 1 ? "" : "s"} set to ${formatBulkUpdateToastLabel(variables.priority ?? "unknown")} priority`,
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });

  const isMutatingBulkTickets = bulkUpdateMutation.isPending;

  return (
    <>
      <Card>
        <CardContent className="space-y-5">
          <AdminTicketsBoardToolbar
            filters={filters}
            applications={applications}
            exportHref={exportHref}
            isFetching={ticketsQuery.isFetching}
            isError={ticketsQuery.isError && tickets.length > 0}
            errorMessage={ticketsQuery.error?.message}
            selectedCount={selectedCount}
            bulkStatus={bulkStatus}
            bulkPriority={bulkPriority}
            isMutatingBulkTickets={isMutatingBulkTickets}
            onRetry={() => ticketsQuery.refetch()}
            onSearchChange={(value) => setFilter("search", value || undefined)}
            onAppChange={(value) => setFilter("appId", value || undefined)}
            onStatusFilterChange={(value) =>
              setFilter(
                "status",
                (value as TicketFilters["status"]) || undefined,
              )
            }
            onTypeFilterChange={(value) =>
              setFilter("type", (value as TicketFilters["type"]) || undefined)
            }
            onBulkStatusChange={(value) =>
              setBulkStatus(value as TicketRecord["status"] | "")
            }
            onBulkPriorityChange={(value) =>
              setBulkPriority(value as TicketRecord["priority"] | "")
            }
            onApplyBulkStatus={() => {
              if (!bulkStatus) {
                return;
              }

              bulkUpdateMutation.mutate({
                ids: selectedVisibleTicketIds,
                status: bulkStatus,
              });
            }}
            onApplyBulkPriority={() => {
              if (!bulkPriority) {
                return;
              }

              bulkUpdateMutation.mutate({
                ids: selectedVisibleTicketIds,
                priority: bulkPriority,
              });
            }}
            onClearSelection={() => setSelectedTicketIds([])}
          />

          <AdminTicketsTable
            tickets={tickets}
            isLoading={ticketsQuery.isLoading}
            isError={ticketsQuery.isError}
            errorMessage={ticketsQuery.error?.message}
            allVisibleSelected={allVisibleSelected}
            hasVisibleTickets={hasVisibleTickets}
            selectedTicketIdSet={selectedTicketIdSet}
            isMutatingBulkTickets={isMutatingBulkTickets}
            onRetry={() => ticketsQuery.refetch()}
            onToggleAllVisible={toggleAllVisibleTickets}
            onToggleTicketSelection={toggleTicketSelection}
            onOpenResponse={(ticketId) => {
              setResponseMessage("");
              setResponseTicketId(ticketId);
            }}
            onOpenReview={setAiReviewTicketId}
            onUpdatePriority={(ticketId, priority) =>
              updatePriorityMutation.mutate({ id: ticketId, priority })
            }
            onUpdateStatus={(ticketId, status) =>
              updateStatusMutation.mutate({ id: ticketId, status })
            }
          />
        </CardContent>
      </Card>

      <TicketResponseDialog
        ticket={responseTicket}
        responseMessage={responseMessage}
        isPending={sendResponseMutation.isPending}
        onResponseMessageChange={setResponseMessage}
        onClose={closeResponseDialog}
        onSubmit={() => {
          if (!responseTicket || !responseMessage.trim()) {
            return;
          }

          sendResponseMutation.mutate({
            id: responseTicket.id,
            message: responseMessage,
          });
        }}
      />

      <TicketAiReviewDialog
        ticket={aiReviewTicket}
        isPending={reviewMutation.isPending}
        onClose={closeAiReviewDialog}
        onReview={(action: TicketReviewAction) => {
          if (!aiReviewTicket) {
            return;
          }

          reviewMutation.mutate({
            id: aiReviewTicket.id,
            action,
          });
        }}
      />
    </>
  );
}
