"use client";

import { Search } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  TableSkeleton,
} from "@/components/feedback/AsyncStates";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TicketDuplicateIndicator } from "@/features/tickets/components/TicketDuplicateIndicator";
import type { TicketRecord } from "@/features/tickets/components/adminTicketsBoard.types";
import {
  formatTypeLabel,
  prioritySelectClassName,
  statusSelectClassName,
  ticketPriorityOptions,
  ticketStatusOptions,
  typeTagClassName,
  typeTagDotClassName,
} from "@/features/tickets/components/adminTicketsBoard.utils";
import { formatDate } from "@/lib/utils";

interface AdminTicketsTableProps {
  tickets: TicketRecord[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  allVisibleSelected: boolean;
  hasVisibleTickets: boolean;
  selectedTicketIdSet: ReadonlySet<string>;
  isMutatingBulkTickets: boolean;
  onRetry: () => void;
  onToggleAllVisible: (checked: boolean) => void;
  onToggleTicketSelection: (ticketId: string, checked: boolean) => void;
  onOpenResponse: (ticketId: string) => void;
  onOpenReview: (ticketId: string) => void;
  onUpdatePriority: (
    ticketId: string,
    priority: TicketRecord["priority"],
  ) => void;
  onUpdateStatus: (ticketId: string, status: TicketRecord["status"]) => void;
}

export function AdminTicketsTable({
  tickets,
  isLoading,
  isError,
  errorMessage,
  allVisibleSelected,
  hasVisibleTickets,
  selectedTicketIdSet,
  isMutatingBulkTickets,
  onRetry,
  onToggleAllVisible,
  onToggleTicketSelection,
  onOpenResponse,
  onOpenReview,
  onUpdatePriority,
  onUpdateStatus,
}: AdminTicketsTableProps) {
  if (isLoading && tickets.length === 0) {
    return (
      <div className="space-y-4">
        <LoadingState
          title="Loading tickets"
          description="Applying the current filters and loading the matching tickets."
        />
        <TableSkeleton
          columns={9}
          columnTemplate="3rem minmax(14rem,1.8fr) minmax(10rem,1fr) minmax(10rem,1fr) minmax(7rem,0.7fr) minmax(7rem,0.7fr) minmax(7rem,0.7fr) minmax(8rem,0.8fr) 3.5rem"
          rows={6}
          headerWidths={[
            "35%",
            "42%",
            "52%",
            "58%",
            "48%",
            "50%",
            "46%",
            "50%",
            "30%",
          ]}
          bodyWidths={[
            "35%",
            "88%",
            "62%",
            "72%",
            "56%",
            "56%",
            "56%",
            "60%",
            "40%",
          ]}
          secondaryLineColumns={[3]}
          secondaryLineWidths={["0%", "0%", "0%", "58%"]}
        />
      </div>
    );
  }

  if (isError && tickets.length === 0) {
    return (
      <ErrorState
        title="Unable to load tickets"
        description={errorMessage ?? "Request failed"}
        action={
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Retry fetch
          </Button>
        }
      />
    );
  }

  if (!isLoading && !isError && tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets match these filters"
        description="Adjust the search or filters to widen the board, or wait for new submissions to arrive."
      />
    );
  }

  return (
    <div className="border-border overflow-x-auto overflow-y-hidden rounded-[18px] border">
      <div className="min-w-full">
        <table className="divide-border w-full min-w-245 divide-y text-left text-[13px]">
          <thead className="bg-muted/70 text-muted-foreground">
            <tr>
              <th className="w-12 px-3.5 py-2.5">
                <input
                  type="checkbox"
                  className="border-border bg-input text-accent h-4 w-4 rounded border align-middle"
                  aria-label="Select all visible tickets"
                  checked={allVisibleSelected}
                  disabled={!hasVisibleTickets}
                  onChange={(event) => onToggleAllVisible(event.target.checked)}
                />
              </th>
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
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="cursor-pointer hover:bg-white/2"
                onClick={() => onOpenResponse(ticket.id)}
              >
                <td className="px-3.5 py-3.5 align-top">
                  <input
                    type="checkbox"
                    className="border-border bg-input text-accent h-4 w-4 rounded border align-middle"
                    aria-label={`Select ticket ${ticket.title}`}
                    checked={selectedTicketIdSet.has(ticket.id)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onToggleTicketSelection(ticket.id, event.target.checked)
                    }
                  />
                </td>
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
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[12px] font-semibold ${typeTagClassName(ticket.type)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${typeTagDotClassName(ticket.type)}`}
                      aria-hidden="true"
                    />
                    {formatTypeLabel(ticket.type)}
                  </span>
                </td>
                <td className="px-3.5 py-3.5 align-top">
                  <Select
                    size="sm"
                    className={`min-w-28 font-medium ${prioritySelectClassName(ticket.priority)}`}
                    value={ticket.priority}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onUpdatePriority(
                        ticket.id,
                        event.target.value as TicketRecord["priority"],
                      )
                    }
                    disabled={isMutatingBulkTickets}
                  >
                    {ticketPriorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3.5 py-3.5 align-top">
                  <Select
                    size="sm"
                    className={`min-w-28 font-medium ${statusSelectClassName(ticket.status)}`}
                    value={ticket.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onUpdateStatus(
                        ticket.id,
                        event.target.value as TicketRecord["status"],
                      )
                    }
                    disabled={isMutatingBulkTickets}
                  >
                    {ticketStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenReview(ticket.id);
                    }}
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
  );
}
