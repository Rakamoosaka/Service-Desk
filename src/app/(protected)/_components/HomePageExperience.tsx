"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { HomeServiceUptimeCard } from "@/app/(protected)/_components/HomeServiceUptimeCard";
import { SignOutButton } from "@/components/navigation/SignOutButton";
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
            className="border-b border-white/8 pb-5 xl:sticky xl:top-8 xl:border-r xl:border-b-0 xl:pr-6 xl:pb-0"
          >
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-white/52 uppercase">
                Service desk
              </p>
              <h1 className="display-face text-[1.35rem] leading-none font-semibold tracking-[-0.03em] text-white">
                Welcome back, {firstName}.
              </h1>
              <p className="text-xs leading-5 text-white/54">
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

              {session.user.role === "admin" ? (
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="h-9 rounded-xl border-white/10 bg-transparent px-3.5 text-white/72 hover:border-white/16 hover:bg-white/4 hover:text-white"
                >
                  <Link href="/admin">
                    <ShieldCheck className="size-4" />
                    Open admin
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-7 border-t border-white/8 pt-5">
              <div className="overflow-hidden rounded-lg border border-white/8">
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                    Applications
                  </p>
                  <p className="text-accent text-lg font-semibold">
                    {totals.applications}
                  </p>
                </div>
                <div className="border-t border-white/8" />
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                    Services
                  </p>
                  <p className="text-accent text-lg font-semibold">
                    {totals.services}
                  </p>
                </div>
                <div className="border-t border-white/8" />
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                    Attention needed
                  </p>
                  <p
                    className={
                      totals.outages + totals.degraded > 0
                        ? "text-warning text-lg font-semibold"
                        : "text-accent text-lg font-semibold"
                    }
                  >
                    {totals.outages + totals.degraded}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-white/8 pt-5">
              <div className="flex items-start gap-3">
                <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {session.user.name}
                  </p>
                  <p className="truncate text-xs text-white/48">
                    {session.user.email}
                  </p>
                </div>

                <SignOutButton
                  iconOnly
                  className="text-white/64 hover:text-white"
                />
              </div>
            </div>
          </motion.aside>

          <motion.section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-2.5">
                <p className="text-accent text-[11px] font-semibold tracking-[0.32em] uppercase">
                  Uptime status
                </p>
                <h2 className="display-face max-w-3xl text-xl font-semibold tracking-[-0.03em] text-white md:text-[1.6rem]">
                  Live application health.
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
                    <div className="rounded-xl border border-white/8 p-6 md:p-7">
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
                              <h3 className="display-face text-lg font-semibold tracking-[-0.03em] text-white md:text-[1.25rem]">
                                {application.name}
                              </h3>
                              <p className="text-muted-foreground mt-2 max-w-xl text-xs leading-6">
                                {application.description}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl border-white/10 bg-transparent px-3.5 text-white/72 hover:border-white/16 hover:bg-white/4 hover:text-white"
                            onClick={() => openIntake(application.slug)}
                          >
                            Create ticket
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-white/8 bg-black/20">
                          <div className="grid md:grid-cols-4">
                            <div className="border-white/8 px-4 py-4 md:border-r md:px-5 md:py-5">
                              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                                Services
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-white">
                                {application.services.length}
                              </p>
                            </div>
                            <div className="border-t border-white/8 px-4 py-4 md:border-t-0 md:border-r md:px-5 md:py-5">
                              <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">
                                Operational
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-white">
                                {application.counts.operational}
                              </p>
                            </div>
                            <div className="border-t border-white/8 px-4 py-4 md:border-t-0 md:border-r md:px-5 md:py-5">
                              <p className="text-warning text-[11px] font-semibold tracking-[0.24em] uppercase">
                                Degraded
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-white">
                                {application.counts.degraded}
                              </p>
                            </div>
                            <div className="border-t border-white/8 px-4 py-4 md:border-t-0 md:px-5 md:py-5">
                              <p className="text-destructive text-[11px] font-semibold tracking-[0.24em] uppercase">
                                Outage
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-white">
                                {application.counts.outage}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/15">
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
                            <div className="border-border bg-muted/40 text-muted-foreground m-4 rounded-lg border border-dashed p-5 text-sm">
                              No services are mapped to this application yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-xl border border-white/8 p-6">
                  <div className="space-y-3">
                    <p className="text-accent text-[11px] font-semibold tracking-[0.28em] uppercase">
                      No monitored services
                    </p>
                    <h3 className="display-face text-3xl font-semibold tracking-[-0.03em] text-white">
                      Add real applications and services to see live Kuma status
                      here
                    </h3>
                    <p className="text-muted-foreground max-w-3xl text-sm leading-7">
                      The seeded demo applications and services have been
                      removed. Once you configure real services with Uptime Kuma
                      identifiers, this homepage will start polling and render
                      their monitor history strips automatically.
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
