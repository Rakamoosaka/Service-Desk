import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardEyebrow } from "@/components/ui/Card";
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";
import { ServiceUptimePanel } from "@/features/uptime/components/ApplicationUptimePanel";
import { getApplicationBySlugCached } from "@/features/applications/server/applicationService";
import { getServiceBySlugs } from "@/features/services/server/serviceService";
import { getServiceUptime } from "@/features/uptime/server/uptimeService";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

interface ServicePageProps {
  params: Promise<{
    slug: string;
    serviceSlug: string;
  }>;
}

function ticketTone(status: "new" | "in_review" | "resolved" | "closed") {
  switch (status) {
    case "new":
      return "info" as const;
    case "in_review":
      return "warning" as const;
    case "resolved":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  await requireUser();
  const { slug, serviceSlug } = await params;
  const [application, service] = await Promise.all([
    getApplicationBySlugCached(slug),
    getServiceBySlugs(slug, serviceSlug),
  ]);

  if (!application || !service) {
    notFound();
  }

  const initialUptime = await getServiceUptime(service.uptimeKumaIdentifier);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-8 px-6 py-8 md:px-8 md:py-10 xl:px-10">
      <SectionIntro
        eyebrow="Service"
        title={service.name}
        description={service.description}
        actions={
          <Button asChild variant="secondary">
            <Link href={`/app/${application.slug}` as Route}>
              <ChevronLeft className="size-4" />
              Back to application
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge tone="neutral">Application: {application.name}</Badge>
        <Badge tone="accent">/{service.slug}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TicketIntakeForm
          applicationId={application.id}
          services={application.services}
          defaultServiceId={service.id}
        />

        <div className="space-y-6">
          <ServiceUptimePanel
            applicationSlug={application.slug}
            serviceSlug={service.slug}
            initialSnapshot={initialUptime}
          />

          <Card>
            <CardContent className="space-y-4">
              <div>
                <CardEyebrow>Activity</CardEyebrow>
                <p className="display-face mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Recent service tickets
                </p>
                <p className="text-muted-foreground mt-3 text-sm leading-7">
                  These tickets are scoped to this service, which makes it
                  easier to compare user pain against live health signals.
                </p>
              </div>

              <div className="space-y-3">
                {service.tickets.length ? (
                  service.tickets.slice(0, 6).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border-border bg-muted/50 rounded-[18px] border p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">
                          {ticket.title}
                        </p>
                        <Badge tone={ticketTone(ticket.status)}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                        <Badge tone="accent">{ticket.type}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm">
                        Opened {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="border-border bg-muted/40 text-muted-foreground rounded-[18px] border border-dashed p-5 text-sm">
                    No service-scoped tickets have been submitted yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
