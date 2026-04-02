"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { HomeServiceUptimeCard } from "@/app/(protected)/_components/HomeServiceUptimeCard";
import { EmptyState } from "@/components/feedback/AsyncStates";
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
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";
import type { UptimeSnapshot } from "@/features/uptime/server/uptimeTypes";

interface ApplicationStatusExperienceProps {
  application: {
    id: string;
    name: string;
    slug: string;
    description: string;
    overallStatus: "operational" | "degraded" | "outage" | "unknown";
    overallLabel: string;
    counts: {
      operational: number;
      degraded: number;
      outage: number;
      unknown: number;
    };
    services: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      isActive: boolean;
      applicationSlug: string;
      healthStatus: "operational" | "degraded" | "outage" | "unknown";
      healthLabel: string;
      checkedAt: string | null;
      statusPageUrl: string | null;
      initialSnapshot: UptimeSnapshot;
    }>;
  };
}

function statusTone(
  status: ApplicationStatusExperienceProps["application"]["overallStatus"],
) {
  switch (status) {
    case "operational":
      return "success" as const;
    case "degraded":
      return "warning" as const;
    case "outage":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export function ApplicationStatusExperience({
  application,
}: ApplicationStatusExperienceProps) {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const activeServices = application.services
    .filter((service) => service.isActive)
    .map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
    }));

  return (
    <>
      <Dialog open={isIntakeOpen} onOpenChange={setIsIntakeOpen}>
        <DialogContent className="border-border/70 bg-panel max-h-[88vh] w-[min(92vw,940px)] overflow-hidden rounded-[18px] p-0 shadow-none [&_.panel-grid]:hidden">
          <div className="flex max-h-[88vh] flex-col overflow-hidden">
            <div className="border-border/70 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
              <DialogHeader className="max-w-3xl">
                <p className="text-accent text-[11px] font-semibold tracking-[0.3em] uppercase">
                  Application intake
                </p>
                <DialogTitle className="text-[1.9rem] md:text-[2.15rem]">
                  Create ticket for {application.name}
                </DialogTitle>
                <DialogDescription className="text-[13px] leading-6 md:text-sm md:leading-6">
                  Submit an application-level or service-level request without
                  leaving this status view.
                </DialogDescription>
              </DialogHeader>

              <DialogDismissButton onClick={() => setIsIntakeOpen(false)} />
            </div>

            <div className="overflow-y-auto px-5 py-5 md:px-6 md:py-6">
              <TicketIntakeForm
                applicationId={application.id}
                services={activeServices}
                compact
                hideTypeBadge
                eyebrow=""
                title=""
                description=""
                onSuccess={() => setIsIntakeOpen(false)}
                headerAddon={
                  <div className="border-border/70 border-t pt-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="text-foreground/48 flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
                          <span>Selected application</span>
                          <span
                            aria-hidden="true"
                            className="bg-foreground/18 size-1 rounded-full"
                          />
                          <span>
                            {activeServices.length} service
                            {activeServices.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <p className="display-face text-foreground truncate text-[1.5rem] font-semibold tracking-[-0.045em] md:text-[1.8rem]">
                          {application.name}
                        </p>
                      </div>
                    </div>
                  </div>
                }
                submitButtonClassName="!shadow-none hover:!shadow-none"
                submitLabel="Create ticket"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 xl:px-6 xl:py-10"
      >
        <div className="space-y-4">
          <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-xl bg-transparent px-3.5"
            >
              <Link href="/">
                <ArrowLeft className="size-4" />
                All applications
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(application.overallStatus)}>
                {application.overallLabel}
              </Badge>
              <Badge tone="neutral">/{application.slug}</Badge>
            </div>
          </div>

          <div className="border-border/70 rounded-xl border p-6 md:p-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2.5">
                  <p className="text-accent text-[11px] font-semibold tracking-[0.32em] uppercase">
                    Application status
                  </p>

                  <div>
                    <h1 className="display-face text-foreground text-[1.75rem] font-semibold tracking-[-0.03em] md:text-[2.3rem]">
                      {application.name}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-7">
                      {application.description}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl bg-transparent px-3.5"
                  onClick={() => setIsIntakeOpen(true)}
                >
                  Create ticket
                  <ArrowRight className="size-4" />
                </Button>
              </div>

              <div className="border-border/70 bg-muted/35 overflow-hidden rounded-xl border">
                <div className="grid md:grid-cols-4">
                  <div className="border-border/70 px-4 py-4 md:border-r md:px-5 md:py-5">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Services
                    </p>
                    <p className="text-foreground mt-3 text-2xl font-semibold">
                      {application.services.length}
                    </p>
                  </div>
                  <div className="border-border/70 border-t px-4 py-4 md:border-t-0 md:border-r md:px-5 md:py-5">
                    <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Operational
                    </p>
                    <p className="text-foreground mt-3 text-2xl font-semibold">
                      {application.counts.operational}
                    </p>
                  </div>
                  <div className="border-border/70 border-t px-4 py-4 md:border-t-0 md:border-r md:px-5 md:py-5">
                    <p className="text-warning text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Degraded
                    </p>
                    <p className="text-foreground mt-3 text-2xl font-semibold">
                      {application.counts.degraded}
                    </p>
                  </div>
                  <div className="border-border/70 border-t px-4 py-4 md:border-t-0 md:px-5 md:py-5">
                    <p className="text-destructive text-[11px] font-semibold tracking-[0.24em] uppercase">
                      Outage
                    </p>
                    <p className="text-foreground mt-3 text-2xl font-semibold">
                      {application.counts.outage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-border/70 bg-muted/30 rounded-2xl border">
                {application.services.length ? (
                  application.services.map((service) => (
                    <HomeServiceUptimeCard
                      key={service.id}
                      applicationSlug={service.applicationSlug}
                      serviceSlug={service.slug}
                      serviceName={service.name}
                      isActive={service.isActive}
                      initialSnapshot={service.initialSnapshot}
                    />
                  ))
                ) : (
                  <div className="m-4">
                    <EmptyState
                      title="No services are mapped to this application yet"
                      description="Sync monitors from Uptime Kuma or add service mappings before using this status view."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
