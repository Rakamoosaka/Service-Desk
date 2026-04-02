"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import type { TicketRecord } from "@/features/tickets/components/adminTicketsBoard.types";

interface TicketResponseDialogProps {
  ticket: TicketRecord | null;
  responseMessage: string;
  isPending: boolean;
  onResponseMessageChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function TicketResponseDialog({
  ticket,
  responseMessage,
  isPending,
  onResponseMessageChange,
  onClose,
  onSubmit,
}: TicketResponseDialogProps) {
  return (
    <Dialog
      open={Boolean(ticket)}
      onOpenChange={(open) => (!open ? onClose() : null)}
    >
      <DialogContent className="max-h-[88vh] w-[min(92vw,760px)] overflow-y-auto rounded-[18px] p-0 shadow-none">
        {ticket ? (
          <div className="flex flex-col">
            <div className="border-border/70 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
              <DialogHeader className="max-w-3xl">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                  Reply to ticket
                </p>
                <DialogTitle className="text-[1.65rem] md:text-[1.9rem]">
                  {ticket.title}
                </DialogTitle>
                <DialogDescription className="text-[13px] leading-6 md:text-sm md:leading-6">
                  Send a direct email response to the user based on the full
                  ticket details below.
                </DialogDescription>
              </DialogHeader>

              <DialogDismissButton onClick={onClose} />
            </div>

            <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
              <div className="border-border bg-panel/55 rounded-[18px] border p-4 md:p-5">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                  Description
                </p>
                <p className="text-foreground mt-3 text-sm leading-7 whitespace-pre-wrap md:text-[15px]">
                  {ticket.description}
                </p>
              </div>

              <form
                className="border-border bg-muted/30 space-y-3 rounded-[18px] border p-4 md:p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="ticket-response">Response</Label>
                  <Textarea
                    id="ticket-response"
                    value={responseMessage}
                    onChange={(event) =>
                      onResponseMessageChange(event.target.value)
                    }
                    placeholder="Write the email that should be sent to the user."
                    disabled={isPending}
                  />
                  <p className="text-muted-foreground text-sm leading-6">
                    This will be emailed to {ticket.submittedBy.email}.
                  </p>
                </div>

                <div className="border-border/70 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm leading-7">
                    Use this reply to respond directly to the ticket submitter.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button size="sm" variant="secondary" onClick={onClose}>
                      Close
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      disabled={isPending || !responseMessage.trim()}
                    >
                      {isPending ? "Sending..." : "Send email"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
