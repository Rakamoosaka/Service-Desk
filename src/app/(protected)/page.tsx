import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth/session";
import { listApplicationsCached } from "@/features/applications/server/applicationService";

export default async function HomePage() {
  const session = await requireUser();
  const applications = await listApplicationsCached();

  return (
    <>
      <SectionIntro
        eyebrow="Workspace"
        title="Application support catalog"
        description="Open an application to review recent ticket activity and submit new feedback, suggestions, or bug reports."
        actions={
          session.user.role === "admin" ? (
            <Button asChild variant="secondary">
              <Link href="/admin">
                <ShieldCheck className="size-4" />
                Admin overview
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-3">
                <Badge tone="accent">/{application.slug}</Badge>
                <div>
                  <h2 className="text-2xl font-semibold">{application.name}</h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {application.description}
                  </p>
                </div>
              </div>
              <Link
                href={`/app/${application.slug}` as Route}
                className="text-accent inline-flex items-center gap-2 text-sm font-semibold"
              >
                Open workspace
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
