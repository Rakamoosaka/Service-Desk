"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type TicketRecord = {
  id: string;
  title: string;
  type: "feedback" | "suggestion" | "bug";
  status: "new" | "in_review" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical" | "unknown";
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

export function AdminTicketsBoard({ initialTickets }: AdminTicketsBoardProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>({});
  const deferredSearch = useDeferredValue(filters.search);
  const activeFilters = { ...filters, search: deferredSearch };

  const ticketsQuery = useQuery({
    queryKey: queryKeys.tickets(activeFilters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (activeFilters.status) params.set("status", activeFilters.status);
      if (activeFilters.type) params.set("type", activeFilters.type);
      if (activeFilters.search) params.set("search", activeFilters.search);

      return fetchJson<TicketRecord[]>(`/api/tickets?${params.toString()}`);
    },
    initialData:
      !activeFilters.status && !activeFilters.type && !activeFilters.search
        ? initialTickets
        : undefined,
  });

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

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.4fr_0.4fr]">
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
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status:
                  (event.target.value as TicketFilters["status"]) || undefined,
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
                  (event.target.value as TicketFilters["type"]) || undefined,
              }))
            }
          >
            <option value="">All types</option>
            <option value="feedback">Feedback</option>
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug</option>
          </Select>
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
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-border bg-panel divide-y">
              {ticketsQuery.data?.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">
                          {ticket.title}
                        </p>
                        <Badge tone="accent">{ticket.type}</Badge>
                        <Badge tone="neutral">{ticket.priority}</Badge>
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
  );
}
