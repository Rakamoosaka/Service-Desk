import { notFound } from "next/navigation";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";
import { getApplicationBySlugCached } from "@/features/applications/server/applicationService";
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

  return (
    <>
      <SectionIntro
        eyebrow="Application"
        title={application.name}
        description={application.description}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TicketIntakeForm appId={application.id} />

        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm font-semibold">Recent ticket activity</p>
              <p className="text-muted-foreground text-sm">
                Service health will arrive in phase 6 through the provider
                abstraction planned in the grand plan.
              </p>
            </div>

            <div className="space-y-3">
              {application.tickets.length ? (
                application.tickets.slice(0, 6).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border-border/80 bg-background/70 rounded-3xl border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{ticket.title}</p>
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
                <div className="border-border bg-background/60 text-muted-foreground rounded-3xl border border-dashed p-5 text-sm">
                  No tickets have been submitted for this application yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
