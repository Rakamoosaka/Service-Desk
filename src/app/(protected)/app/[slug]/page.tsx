import { notFound } from "next/navigation";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardEyebrow } from "@/components/ui/Card";
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";
import { ApplicationUptimePanel } from "@/features/uptime/components/ApplicationUptimePanel";
import { getApplicationBySlugCached } from "@/features/applications/server/applicationService";
import { getApplicationUptime } from "@/features/uptime/server/uptimeService";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

interface ApplicationPageProps {
  params: Promise<{
    slug: string;
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

export default async function ApplicationPage({
  params,
}: ApplicationPageProps) {
  await requireUser();
  const { slug } = await params;
  const application = await getApplicationBySlugCached(slug);

  if (!application) {
    notFound();
  }

  const initialUptime = await getApplicationUptime(
    application.slug,
    application.uptimeKumaIdentifier,
  );

  return (
    <>
      <SectionIntro
        eyebrow="Application"
        title={application.name}
        description={application.description}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TicketIntakeForm appId={application.id} />

        <div className="space-y-6">
          <ApplicationUptimePanel
            applicationSlug={application.slug}
            initialSnapshot={initialUptime}
          />

          <Card>
            <CardContent className="space-y-4">
              <div>
                <CardEyebrow>Activity</CardEyebrow>
                <p className="display-face mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Recent ticket activity
                </p>
                <p className="text-muted-foreground mt-3 text-sm leading-7">
                  Ticket activity stays local to the application page so admins
                  and requesters can compare queue pressure against service
                  health at a glance.
                </p>
              </div>

              <div className="space-y-3">
                {application.tickets.length ? (
                  application.tickets.slice(0, 6).map((ticket) => (
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
                    No tickets have been submitted for this application yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
