"use client";

import type { Route } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RequestIntakeModal } from "@/features/tickets/components/RequestIntakeModal";
import type { UptimeSnapshot } from "@/features/uptime/server/uptimeTypes";

interface HomePageExperienceProps {
  session: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
  applicationsWithStatus: Array<{
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
  }>;
  totals: {
    applications: number;
    services: number;
    outages: number;
    degraded: number;
  };
}

function statusTone(
  status: HomePageExperienceProps["applicationsWithStatus"][number]["overallStatus"],
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

export function HomePageExperience({
  session,
  applicationsWithStatus,
  totals,
}: HomePageExperienceProps) {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedApplicationSlug, setSelectedApplicationSlug] = useState("");
  const firstName = session.user.name.split(" ")[0] ?? session.user.name;

  function openIntake(applicationSlug?: string) {
    setSelectedApplicationSlug(applicationSlug ?? "");
    setIsIntakeOpen(true);
  }

  function closeIntake() {
    setIsIntakeOpen(false);
    setSelectedApplicationSlug("");
  }

  return (
    <>
      <RequestIntakeModal
        open={isIntakeOpen}
        onClose={closeIntake}
        applications={applicationsWithStatus.map((application) => ({
          ...application,
          services: application.services
            .filter((service) => service.isActive)
            .map((service) => ({
              id: service.id,
              name: service.name,
              slug: service.slug,
            })),
        }))}
        selectedApplicationSlug={selectedApplicationSlug}
        onSelectedApplicationSlugChange={setSelectedApplicationSlug}
      />

      <motion.div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 xl:px-6 xl:py-10">
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="border-border/80 pb-5 xl:sticky xl:top-8 xl:border-r xl:pr-6 xl:pb-0"
          >
            <div className="space-y-2">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                Service desk
              </p>
              <h1 className="display-face text-foreground text-[1.35rem] leading-tight font-semibold tracking-[-0.03em]">
                Welcome back, {firstName}.
              </h1>
              <p className="text-muted-foreground text-sm leading-6">
                Requests and live application status, in one place.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-start gap-3">
              <Button
                className="h-10 w-full justify-center rounded-xl"
                onClick={() => openIntake()}
              >
                Create ticket
              </Button>

              <div className="flex w-full items-center gap-3">
                {session.user.role === "admin" ? (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="h-9 flex-1 rounded-xl bg-transparent px-3.5"
                  >
                    <Link href="/admin">
                      <ShieldCheck className="size-4" />
                      Open admin
                    </Link>
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                <ThemeToggle />
              </div>
            </div>

            <div className="border-border/80 mt-7 border-t pt-5">
              <div className="border-border bg-panel overflow-hidden rounded-lg border">
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
                    Applications
                  </p>
                  <p className="text-foreground text-lg font-semibold">
                    {totals.applications}
                  </p>
                </div>
                <div className="border-border border-t" />
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
                    Services
                  </p>
                  <p className="text-foreground text-lg font-semibold">
                    {totals.services}
                  </p>
                </div>
                <div className="border-border border-t" />
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
                    Attention needed
                  </p>
                  <p
                    className={
                      totals.outages + totals.degraded > 0
                        ? "text-warning text-lg font-semibold"
                        : "text-foreground text-lg font-semibold"
                    }
                  >
                    {totals.outages + totals.degraded}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/80 mt-7 border-t pt-5">
              <div className="flex items-start gap-3">
                <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-[13px] font-semibold">
                    {session.user.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {session.user.email}
                  </p>
                </div>

                <SignOutButton iconOnly className="text-muted-foreground" />
              </div>
            </div>
          </motion.aside>

          <motion.section className="space-y-4">
            <div className="border-border/80 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
              <div className="space-y-2.5">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                  Applications
                </p>
                <h2 className="display-face text-foreground max-w-3xl text-xl font-semibold tracking-[-0.03em] md:text-[1.5rem]">
                  Open an application for full status and ticket intake.
                </h2>
              </div>
            </div>

            <div className="grid gap-3.5">
              {applicationsWithStatus.length ? (
                applicationsWithStatus.map((application) => (
                  <motion.div
                    key={application.id}
                    layout
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="border-border bg-panel rounded-xl border p-6 md:p-7">
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                tone={statusTone(application.overallStatus)}
                              >
                                {application.overallLabel}
                              </Badge>
                              <Badge tone="neutral">/{application.slug}</Badge>
                            </div>

                            <div>
                              <h3 className="display-face text-foreground text-lg font-semibold tracking-[-0.03em] md:text-[1.2rem]">
                                {application.name}
                              </h3>
                              <p className="text-muted-foreground mt-2 max-w-xl text-xs leading-6">
                                {application.description}
                              </p>
                            </div>
                          </div>

                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="rounded-xl bg-transparent px-3.5"
                          >
                            <Link href={`/app/${application.slug}` as Route}>
                              Open app
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        </div>

                        <div className="border-border bg-muted/30 overflow-hidden rounded-xl border">
                          <div className="grid md:grid-cols-4">
                            <div className="border-border px-4 py-4 md:border-r md:px-5 md:py-5">
                              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                                Services
                              </p>
                              <p className="text-foreground mt-3 text-2xl font-semibold">
                                {application.services.length}
                              </p>
                            </div>
                            <div className="border-border border-t px-4 py-4 md:border-t-0 md:border-r md:px-5 md:py-5">
                              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                                Operational
                              </p>
                              <p className="text-foreground mt-3 text-2xl font-semibold">
                                {application.counts.operational}
                              </p>
                            </div>
                            <div className="border-border border-t px-4 py-4 md:border-t-0 md:border-r md:px-5 md:py-5">
                              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                                Degraded
                              </p>
                              <p className="text-foreground mt-3 text-2xl font-semibold">
                                {application.counts.degraded}
                              </p>
                            </div>
                            <div className="border-border border-t px-4 py-4 md:border-t-0 md:px-5 md:py-5">
                              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                                Outage
                              </p>
                              <p className="text-foreground mt-3 text-2xl font-semibold">
                                {application.counts.outage}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="border-border bg-panel rounded-xl border p-6">
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                      No monitored services
                    </p>
                    <h3 className="display-face text-foreground text-3xl font-semibold tracking-[-0.03em]">
                      Add real applications to build out the app directory
                    </h3>
                    <p className="text-muted-foreground max-w-3xl text-sm leading-7">
                      Once applications and services are configured, this home
                      view will surface their top-level status and route into
                      the dedicated application pages.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </>
  );
}
