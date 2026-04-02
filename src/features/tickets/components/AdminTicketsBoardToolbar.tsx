"use client";

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/feedback/AsyncStates";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { TicketFilters } from "@/features/tickets/schemas/ticketSchemas";
import type { TicketRecord } from "@/features/tickets/components/adminTicketsBoard.types";
import {
  ticketPriorityOptions,
  ticketStatusOptions,
} from "@/features/tickets/components/adminTicketsBoard.utils";

interface AdminTicketsBoardToolbarProps {
  filters: TicketFilters;
  applications: Array<{
    id: string;
    name: string;
  }>;
  exportHref: string;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  selectedCount: number;
  bulkStatus: "" | TicketRecord["status"];
  bulkPriority: "" | TicketRecord["priority"];
  isMutatingBulkTickets: boolean;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onAppChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onBulkStatusChange: (value: string) => void;
  onBulkPriorityChange: (value: string) => void;
  onApplyBulkStatus: () => void;
  onApplyBulkPriority: () => void;
  onClearSelection: () => void;
}

export function AdminTicketsBoardToolbar({
  filters,
  applications,
  exportHref,
  isFetching,
  isError,
  errorMessage,
  selectedCount,
  bulkStatus,
  bulkPriority,
  isMutatingBulkTickets,
  onRetry,
  onSearchChange,
  onAppChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onBulkStatusChange,
  onBulkPriorityChange,
  onApplyBulkStatus,
  onApplyBulkPriority,
  onClearSelection,
}: AdminTicketsBoardToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.4fr_0.4fr_auto]">
        <Input
          placeholder="Search title or description"
          value={filters.search ?? ""}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Select
          value={filters.appId ?? ""}
          onChange={(event) => onAppChange(event.target.value)}
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
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_review">In review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
        <Select
          value={filters.type ?? ""}
          onChange={(event) => onTypeFilterChange(event.target.value)}
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
          <a href={exportHref} aria-label="Download CSV" title="Download CSV">
            <Download className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </div>

      {isFetching ? (
        <InlineNotice
          title="Refreshing tickets"
          description="The board is syncing the latest filtered ticket results in the background."
        />
      ) : null}

      {isError ? (
        <InlineNotice
          tone="danger"
          title="Background refresh failed"
          description={errorMessage ?? "Request failed"}
          action={
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Retry fetch
            </Button>
          }
        />
      ) : null}

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          selectedCount
            ? "max-h-48 opacity-100"
            : "pointer-events-none max-h-0 opacity-0",
        )}
        aria-hidden={!selectedCount}
      >
        <div className="border-border bg-muted/30 flex flex-col gap-3 rounded-[18px] border px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
              Bulk actions
            </p>
            <Badge tone="accent">{selectedCount} selected</Badge>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                className="min-w-40"
                value={bulkStatus}
                disabled={!selectedCount || isMutatingBulkTickets}
                onChange={(event) => onBulkStatusChange(event.target.value)}
              >
                <option value="">Change status</option>
                {ticketStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="secondary"
                disabled={
                  !selectedCount || !bulkStatus || isMutatingBulkTickets
                }
                onClick={onApplyBulkStatus}
              >
                Apply status
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                className="min-w-40"
                value={bulkPriority}
                disabled={!selectedCount || isMutatingBulkTickets}
                onChange={(event) => onBulkPriorityChange(event.target.value)}
              >
                <option value="">Change priority</option>
                {ticketPriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="secondary"
                disabled={
                  !selectedCount || !bulkPriority || isMutatingBulkTickets
                }
                onClick={onApplyBulkPriority}
              >
                Apply priority
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              disabled={!selectedCount}
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
