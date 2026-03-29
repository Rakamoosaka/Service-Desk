"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Layers3, ListTree } from "lucide-react";
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
  CardDescription,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[88vh] overflow-hidden p-0"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="flex max-h-[88vh] flex-col overflow-hidden">
          <div className="border-border/70 flex items-start justify-between gap-4 border-b px-6 py-5 md:px-7">
            <DialogHeader className="max-w-3xl">
              <p className="text-accent text-[11px] font-semibold tracking-[0.3em] uppercase">
                Shared intake
              </p>
              <DialogTitle>
                {isComposeStep
                  ? `Request for ${activeApplicationName}`
                  : "Start a form"}
              </DialogTitle>
              <DialogDescription>
                {isComposeStep
                  ? "The application is locked in. Fill out the request and submit it directly into the service desk queue."
                  : "Choose the application first. The form appears in the second modal state once the request has a destination."}
              </DialogDescription>
            </DialogHeader>

            <DialogDismissButton onClick={onClose} />
          </div>

          <div className="overflow-y-auto px-6 py-6 md:px-7 md:py-7">
            <AnimatePresence mode="wait" initial={false}>
              {isComposeStep ? (
                <motion.div
                  key={`compose-${selectedApplication!.slug}`}
                  initial={modalStepVariants(direction).initial}
                  animate={modalStepVariants(direction).animate}
                  exit={modalStepVariants(direction).exit}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]"
                >
                  <Card>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <CardEyebrow>Selected application</CardEyebrow>
                        <CardTitle className="text-white">
                          {selectedApplication!.name}
                        </CardTitle>
                        <CardDescription className="leading-7">
                          {selectedApplication!.description}
                        </CardDescription>
                      </div>

                      <div className="border-accent/20 bg-accent/8 rounded-[20px] border p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="accent">
                            /{selectedApplication!.slug}
                          </Badge>
                          <Badge tone="neutral">
                            {selectedApplication!.services.length} service
                            {selectedApplication!.services.length === 1
                              ? ""
                              : "s"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="border-border bg-muted/45 rounded-[18px] border p-4">
                          <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
                            <span>Scope</span>
                            <Layers3 className="size-4" />
                          </div>
                          <p className="mt-3 font-semibold text-white">
                            Application-level intake with optional service
                            selection.
                          </p>
                        </div>

                        <div className="border-border bg-muted/45 rounded-[18px] border p-4">
                          <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
                            <span>Services</span>
                            <ListTree className="size-4" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedApplication!.services.length ? (
                              selectedApplication!.services.map((service) => (
                                <Badge key={service.id} tone="neutral">
                                  {service.name}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-muted-foreground text-sm leading-7">
                                No services mapped yet. You can still file an
                                application-level request.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => onSelectedApplicationSlugChange("")}
                      >
                        <ArrowLeft className="size-4" />
                        Change application
                      </Button>
                    </CardContent>
                  </Card>

                  <TicketIntakeForm
                    key={selectedApplication!.id}
                    applicationId={selectedApplication!.id}
                    services={selectedApplication!.services}
                    eyebrow="Shared intake"
                    title="Start a request"
                    description="Choose the request type, describe the problem or idea clearly, and submit it directly into the service desk queue."
                    submitLabel="Send request"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="select-application"
                  initial={modalStepVariants(direction).initial}
                  animate={modalStepVariants(direction).animate}
                  exit={modalStepVariants(direction).exit}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
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
                        className="border-border bg-muted/35 hover:border-accent/40 hover:bg-muted/55 group rounded-3xl border p-5 text-left transition duration-200"
                        onClick={() =>
                          onSelectedApplicationSlugChange(application.slug)
                        }
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="accent">/{application.slug}</Badge>
                          <Badge tone="neutral">
                            {application.services.length} service
                            {application.services.length === 1 ? "" : "s"}
                          </Badge>
                        </div>

                        <h3 className="display-face mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                          {application.name}
                        </h3>
                        <p className="text-muted-foreground mt-3 text-sm leading-7">
                          {application.description}
                        </p>

                        <div className="text-accent mt-5 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase transition group-hover:translate-x-1">
                          Continue
                          <ArrowRight className="size-4" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
