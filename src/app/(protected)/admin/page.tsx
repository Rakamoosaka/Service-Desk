import Link from "next/link";
import { BarChart3, FolderKanban, Ticket, UserRoundCog } from "lucide-react";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/auth/session";
import { listRecentApplications } from "@/features/applications/server/applicationService";
import { getDashboardMetrics } from "@/features/tickets/server/ticketService";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [metrics, recentApplications] = await Promise.all([
    getDashboardMetrics(),
    listRecentApplications(),
  ]);

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Operational overview"
        description="This is the control room for the first four delivery phases: authentication, service catalog management, ticket intake, and ticket operations."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Applications",
            value: metrics.applicationCount,
            icon: <FolderKanban className="size-5" />,
          },
          {
            label: "Tickets",
            value: metrics.ticketCount,
            icon: <Ticket className="size-5" />,
          },
          {
            label: "Users",
            value: metrics.userCount,
            icon: <UserRoundCog className="size-5" />,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-5 p-6">
              <div className="text-muted-foreground flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                {item.icon}
              </div>
              <div>
                <p className="display-face text-5xl leading-none font-semibold">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="size-4" />
              Ticket distribution
            </div>
            <div className="flex flex-wrap gap-2">
              {metrics.distribution.map((entry) => (
                <Badge key={entry.status} tone="neutral">
                  {entry.status.replace("_", " ")}: {entry.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Recently added services</p>
                <p className="text-muted-foreground text-sm">
                  Use the services page to update descriptions and slugs.
                </p>
              </div>
              <Link
                href="/admin/applications"
                className="text-accent text-sm font-semibold"
              >
                Manage catalog
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="border-border/80 bg-background/70 rounded-3xl border p-4"
                >
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
                    /{application.slug}
                  </p>
                  <p className="mt-2 font-semibold">{application.name}</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {application.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
