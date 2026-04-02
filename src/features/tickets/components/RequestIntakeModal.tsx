"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/feedback/AsyncStates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";

type ApplicationSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  services: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

interface RequestIntakeModalProps {
  open: boolean;
  onClose: () => void;
  applications: ApplicationSummary[];
  selectedApplicationSlug: string;
  onSelectedApplicationSlugChange: (slug: string) => void;
}

function modalStepVariants(direction: number) {
  return {
    initial: { opacity: 0, x: 40 * direction, filter: "blur(8px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -28 * direction, filter: "blur(6px)" },
  };
}

export function RequestIntakeModal({
  open,
  onClose,
  applications,
  selectedApplicationSlug,
  onSelectedApplicationSlugChange,
}: RequestIntakeModalProps) {
  const selectedApplication =
    applications.find(
      (application) => application.slug === selectedApplicationSlug,
    ) ?? null;
  const isComposeStep = Boolean(selectedApplication);
  const direction = isComposeStep ? 1 : -1;
  const activeApplicationName = selectedApplication?.name ?? "";
  const placeholderCount = Math.max(0, 3 - applications.length);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[88vh] w-[min(92vw,940px)] overflow-hidden rounded-[18px] border-white/12 bg-[linear-gradient(180deg,rgba(8,12,16,0.995),rgba(8,12,16,0.985))] p-0 shadow-none [&_.panel-grid]:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="flex max-h-[88vh] flex-col overflow-hidden">
          <div className="border-border/70 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
            <DialogHeader className="max-w-3xl">
              <p className="text-accent text-[11px] font-semibold tracking-[0.3em] uppercase">
                Shared intake
              </p>
              <DialogTitle className="text-[1.9rem] md:text-[2.15rem]">
                {isComposeStep
                  ? `Create ticket for ${activeApplicationName}`
                  : "Select application"}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-6 md:text-sm md:leading-6">
                {isComposeStep
                  ? "The destination is set. Add the request details and send it straight to the service desk queue."
                  : "Choose the application you need help with to continue."}
              </DialogDescription>
            </DialogHeader>

            <DialogDismissButton onClick={onClose} />
          </div>

          <div className="overflow-y-auto px-5 py-5 md:px-6 md:py-6">
            <AnimatePresence mode="wait" initial={false}>
              {isComposeStep ? (
                <motion.div
                  key={`compose-${selectedApplication!.slug}`}
                  initial={modalStepVariants(direction).initial}
                  animate={modalStepVariants(direction).animate}
                  exit={modalStepVariants(direction).exit}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className=""
                >
                  <TicketIntakeForm
                    key={selectedApplication!.id}
                    applicationId={selectedApplication!.id}
                    services={selectedApplication!.services}
                    compact
                    hideTypeBadge
                    eyebrow=""
                    title=""
                    description=""
                    onSuccess={onClose}
                    headerAddon={
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 md:px-5 md:py-4.5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                tone="neutral"
                                className="border-white/10 bg-white/4 text-[10px] tracking-[0.18em] text-white/72"
                              >
                                Selected application
                              </Badge>
                              <Badge
                                tone="accent"
                                className="text-accent border-white/10 bg-white/4.5 text-[10px] tracking-[0.18em] shadow-none"
                              >
                                /{selectedApplication!.slug}
                              </Badge>
                              <Badge
                                tone="neutral"
                                className="border-white/10 bg-white/3 text-[10px] tracking-[0.18em] text-white/68"
                              >
                                {selectedApplication!.services.length} service
                                {selectedApplication!.services.length === 1
                                  ? ""
                                  : "s"}
                              </Badge>
                            </div>

                            <div className="min-w-0 space-y-1">
                              <p className="display-face text-[1.15rem] font-semibold tracking-[-0.04em] text-white md:text-[1.3rem]">
                                {selectedApplication!.name}
                              </p>
                              <p className="text-muted-foreground text-[12px] leading-5 md:text-[13px]">
                                This ticket will be created directly against
                                this application unless you switch context.
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full shrink-0 sm:w-auto"
                            onClick={() => onSelectedApplicationSlugChange("")}
                          >
                            <ArrowLeft className="size-4" />
                            Change application
                          </Button>
                        </div>
                      </div>
                    }
                    submitLabel="Create ticket"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="select-application"
                  initial={modalStepVariants(direction).initial}
                  animate={modalStepVariants(direction).animate}
                  exit={modalStepVariants(direction).exit}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  {applications.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {applications.map((application, index) => (
                        <motion.button
                          key={application.id}
                          type="button"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: 0.03 * index,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="group overflow-hidden rounded-2xl border border-white/8 bg-black/16 text-left transition duration-200 hover:border-white/14 hover:bg-black/22"
                          onClick={() =>
                            onSelectedApplicationSlugChange(application.slug)
                          }
                        >
                          <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-4 py-3.5">
                            <Badge
                              tone="accent"
                              className="text-accent border-white/10 bg-white/4.5 text-[11px] shadow-none"
                            >
                              /{application.slug}
                            </Badge>
                            <Badge
                              tone="neutral"
                              className="border-white/10 bg-white/3 text-[11px]"
                            >
                              {application.services.length} service
                              {application.services.length === 1 ? "" : "s"}
                            </Badge>
                          </div>

                          <div className="space-y-3 px-4 py-4">
                            <div>
                              <h3 className="display-face text-[1.7rem] font-semibold tracking-[-0.04em] text-white md:text-[1.85rem]">
                                {application.name}
                              </h3>
                              <p className="text-muted-foreground mt-2.5 text-[13px] leading-6">
                                {application.description}
                              </p>
                            </div>

                            <div className="text-accent inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase transition group-hover:translate-x-1">
                              Continue
                              <ArrowRight className="size-4" />
                            </div>
                          </div>
                        </motion.button>
                      ))}

                      {Array.from({ length: placeholderCount }).map(
                        (_, index) => (
                          <div
                            key={`placeholder-${index}`}
                            className="rounded-2xl border border-dashed border-white/10 bg-transparent p-4 opacity-60"
                          >
                            <div aria-hidden="true" className="min-h-55" />
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-5 md:p-6">
                        <EmptyState
                          title="No applications configured"
                          description="Add a real application with a valid Uptime Kuma identifier from the admin area before opening the shared intake flow."
                        />
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
