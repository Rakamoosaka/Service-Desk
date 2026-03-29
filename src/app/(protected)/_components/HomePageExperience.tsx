"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { HomeServiceUptimeCard } from "@/app/(protected)/_components/HomeServiceUptimeCard";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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

      <motion.div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8 xl:px-6 xl:py-10">
        <motion.section className="relative overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(135deg,rgba(13,215,242,0.16),rgba(255,34,68,0.1)_46%,rgba(8,18,23,0.96))] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:px-6 md:py-7 xl:px-7 xl:py-8">
          <div className="panel-grid absolute inset-0 opacity-25" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
          <div className="relative grid gap-5 xl:grid-cols-[1fr_0.88fr] xl:items-end">
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                <p className="text-[11px] font-semibold tracking-[0.36em] text-white/70 uppercase">
                  Shared landing
                </p>
                <div className="space-y-3">
                  <h1 className="display-face max-w-2xl text-4xl leading-[0.92] font-semibold tracking-[-0.05em] text-white md:text-6xl xl:text-[4rem]">
                    Start the request, not the dashboard.
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-white/70 md:text-[15px]">
                    Everyone lands in the same place now. Open the intake form
                    in one step, then check live application status further down
                    the page before you submit.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.46,
                  delay: 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-wrap items-center gap-3"
              >
                <Button size="lg" onClick={() => openIntake()}>
                  <Sparkles className="size-4" />
                  Start a form
                </Button>

                {session.user.role === "admin" ? (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/admin">
                      <ShieldCheck className="size-4" />
                      Open admin dashboard
                    </Link>
                  </Button>
                ) : null}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="grid gap-3 sm:grid-cols-3 xl:grid-cols-2"
            >
              <div className="rounded-[1.6rem] border border-white/10 bg-black/30 p-4 backdrop-blur-sm sm:col-span-1 xl:col-span-2">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                  Signed in as
                </p>
                <p className="mt-2.5 text-lg font-semibold text-white md:text-xl">
                  {session.user.name}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-white/65">
                  <span>{session.user.email}</span>
                  <Badge
                    tone={session.user.role === "admin" ? "accent" : "neutral"}
                  >
                    {session.user.role}
                  </Badge>
                </div>

                <div className="mt-3.5">
                  <SignOutButton className="w-full justify-center border border-white/10 bg-white/6 px-4 text-white hover:border-white/20 hover:bg-white/10 hover:text-white" />
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                  Applications
                </p>
                <p className="display-face mt-2.5 text-3xl font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
                  {totals.applications}
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                  Services tracked
                </p>
                <p className="display-face mt-2.5 text-3xl font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
                  {totals.services}
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                  Attention needed
                </p>
                <p className="display-face mt-2.5 text-3xl font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
                  {totals.outages + totals.degraded}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-2.5">
              <p className="text-accent text-[11px] font-semibold tracking-[0.32em] uppercase">
                Uptime status
              </p>
              <h2 className="display-face max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-[2.35rem]">
                Live application health at the bottom, exactly where it belongs.
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
                  <Card>
                    <CardContent className="space-y-4 md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={statusTone(application.overallStatus)}>
                              {application.overallLabel}
                            </Badge>
                            <Badge tone="neutral">/{application.slug}</Badge>
                          </div>

                          <div>
                            <h3 className="display-face text-2xl font-semibold tracking-[-0.03em] text-white md:text-[2rem]">
                              {application.name}
                            </h3>
                            <p className="text-muted-foreground mt-2.5 max-w-2xl text-sm leading-6">
                              {application.description}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openIntake(application.slug)}
                        >
                          Open form
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="border-border bg-muted/45 rounded-[18px] border p-3.5">
                          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                            Services
                          </p>
                          <p className="mt-2.5 text-xl font-semibold text-white md:text-2xl">
                            {application.services.length}
                          </p>
                        </div>
                        <div className="border-accent/30 bg-accent/10 rounded-[18px] border p-3.5">
                          <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">
                            Operational
                          </p>
                          <p className="mt-2.5 text-xl font-semibold text-white md:text-2xl">
                            {application.counts.operational}
                          </p>
                        </div>
                        <div className="border-warning/30 bg-warning/10 rounded-[18px] border p-3.5">
                          <p className="text-warning text-[11px] font-semibold tracking-[0.24em] uppercase">
                            Degraded
                          </p>
                          <p className="mt-2.5 text-xl font-semibold text-white md:text-2xl">
                            {application.counts.degraded}
                          </p>
                        </div>
                        <div className="border-destructive/30 bg-destructive/10 rounded-[18px] border p-3.5">
                          <p className="text-destructive text-[11px] font-semibold tracking-[0.24em] uppercase">
                            Outage
                          </p>
                          <p className="mt-2.5 text-xl font-semibold text-white md:text-2xl">
                            {application.counts.outage}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3">
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
                          <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
                            No services are mapped to this application yet.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="space-y-3">
                  <p className="text-accent text-[11px] font-semibold tracking-[0.28em] uppercase">
                    No monitored services
                  </p>
                  <h3 className="display-face text-3xl font-semibold tracking-[-0.03em] text-white">
                    Add real applications and services to see live Kuma status
                    here
                  </h3>
                  <p className="text-muted-foreground max-w-3xl text-sm leading-7">
                    The seeded demo applications and services have been removed.
                    Once you configure real services with Uptime Kuma
                    identifiers, this homepage will start polling and render
                    their monitor history strips automatically.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.section>
      </motion.div>
    </>
  );
}
