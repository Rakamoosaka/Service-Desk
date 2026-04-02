"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type {
  TicketRecord,
  TicketReviewAction,
} from "@/features/tickets/components/adminTicketsBoard.types";
import { sentenceCase } from "@/features/tickets/components/adminTicketsBoard.utils";

interface TicketAiReviewDialogProps {
  ticket: TicketRecord | null;
  isPending: boolean;
  onClose: () => void;
  onReview: (action: TicketReviewAction) => void;
}

export function TicketAiReviewDialog({
  ticket,
  isPending,
  onClose,
  onReview,
}: TicketAiReviewDialogProps) {
  return (
    <Dialog
      open={Boolean(ticket)}
      onOpenChange={(open) => (!open ? onClose() : null)}
    >
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[min(100vw-1rem,880px)] overflow-y-auto rounded-[18px] p-0 shadow-none md:w-[min(92vw,880px)]">
        {ticket ? (
          <div className="flex flex-col">
            <div className="border-border/70 flex flex-col items-start gap-4 border-b px-4 py-4 sm:flex-row sm:justify-between sm:px-5 md:px-6 md:py-5">
              <DialogHeader className="max-w-3xl">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                  Ticket details
                </p>
                <DialogTitle className="text-[1.65rem] md:text-[1.9rem]">
                  {ticket.title}
                </DialogTitle>
                <DialogDescription className="text-[13px] leading-6 md:text-sm md:leading-6">
                  Review the ticket contents, then handle triage suggestions and
                  duplicate flags if needed.
                </DialogDescription>
              </DialogHeader>

              <DialogDismissButton onClick={onClose} />
            </div>

            <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
              <div className="border-border bg-panel/55 rounded-[18px] border p-4 md:p-5">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                  Ticket contents
                </p>
                <p className="text-foreground mt-3 text-sm leading-7 whitespace-pre-wrap md:text-[15px]">
                  {ticket.description}
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
                      <Badge tone="neutral">{sentenceCase(ticket.type)}</Badge>
                    </div>

                    <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                        Suggested lane
                      </span>
                      <Badge tone="accent">
                        {sentenceCase(
                          ticket.aiTriage.recommendedType ?? ticket.type,
                        )}
                      </Badge>
                    </div>

                    <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                        Confidence
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {ticket.aiTriage.recommendedTypeConfidence
                          ? `${Math.round(ticket.aiTriage.recommendedTypeConfidence)}%`
                          : "n/a"}
                      </span>
                    </div>
                  </div>

                  <div className="border-border/70 bg-panel/35 mt-4 rounded-2xl border px-3.5 py-3.5">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                      Why this was suggested
                    </p>
                    <p className="text-foreground/88 mt-2 text-sm leading-6">
                      {ticket.aiTriage.typeReason ??
                        "No category change was suggested for this ticket."}
                    </p>
                  </div>

                  {ticket.aiSuggestionStatus === "pending_review" ? (
                    <div className="mt-4 flex justify-end gap-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => onReview("dismiss_type")}
                      >
                        Dismiss lane change
                      </Button>
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => onReview("accept_type")}
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
                        {sentenceCase(ticket.aiTriage.sentiment ?? "n/a")}
                      </Badge>
                    </div>

                    <div className="border-border/70 bg-panel/45 flex items-center justify-between gap-4 rounded-2xl border px-3.5 py-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                        Service impact
                      </span>
                      <Badge tone="neutral">
                        {sentenceCase(ticket.aiTriage.technicalImpact ?? "n/a")}
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

                  {ticket.suspectedDuplicateTicket &&
                  ticket.aiSuggestionStatus === "pending_review" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => onReview("clear_all_duplicates")}
                    >
                      Delete all
                    </Button>
                  ) : null}
                </div>

                {ticket.suspectedDuplicateTicket ? (
                  <ul className="mt-4 space-y-3">
                    <li className="border-border/70 bg-panel/35 rounded-2xl border px-4 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="warning">
                              {ticket.aiTriage.duplicateScore
                                ? `${Math.round(ticket.aiTriage.duplicateScore)}% match`
                                : "possible duplicate"}
                            </Badge>
                            <Badge tone="neutral">
                              {sentenceCase(
                                ticket.suspectedDuplicateTicket.status,
                              )}
                            </Badge>
                          </div>

                          <p className="text-foreground font-semibold">
                            {ticket.suspectedDuplicateTicket.title}
                          </p>

                          <p className="text-muted-foreground text-sm leading-7">
                            {ticket.aiTriage.duplicateReason ??
                              "This ticket appears related to an earlier item in the queue."}
                          </p>

                          {ticket.aiTriage.duplicateSignals?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {ticket.aiTriage.duplicateSignals.map(
                                (signal) => (
                                  <Badge key={signal} tone="neutral">
                                    {signal}
                                  </Badge>
                                ),
                              )}
                            </div>
                          ) : null}
                        </div>

                        {ticket.aiSuggestionStatus === "pending_review" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="shrink-0"
                            disabled={isPending}
                            onClick={() => onReview("clear_duplicate")}
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

              <div className="border-border/70 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm leading-7">
                  {ticket.aiSuggestionStatus === "pending_review"
                    ? "Use the action inside Lane recommendation to apply the lane change, and manage duplicate reminders from the list above."
                    : "No pending suggestion changes are waiting for review on this ticket."}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="sm" variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
