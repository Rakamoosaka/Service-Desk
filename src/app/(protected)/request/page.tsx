import { SectionIntro } from "@/components/layout/SectionIntro";
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { listApplicationsWithServicesCached } from "@/features/applications/server/applicationService";
import { RequestWorkspace } from "@/features/tickets/components/RequestWorkspace";
import { requireUser } from "@/lib/auth/session";

interface RequestPageProps {
  searchParams: Promise<{
    app?: string;
  }>;
}

export default async function RequestPage({ searchParams }: RequestPageProps) {
  await requireUser();
  const applications = await listApplicationsWithServicesCached();
  const { app } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-8 px-6 py-8 md:px-8 md:py-10 xl:px-10">
      <SectionIntro
        eyebrow="Shared intake"
        title="Start a form"
        description="Pick the application inside the intake flow, then submit a bug, change request, or general feedback without entering the admin workspace."
      />

      {applications.length ? (
        <RequestWorkspace
          applications={applications}
          initialApplicationSlug={app}
        />
      ) : (
        <Card>
          <CardContent className="space-y-3">
            <CardEyebrow>Request intake</CardEyebrow>
            <CardTitle className="text-white">
              No applications are configured yet
            </CardTitle>
            <CardDescription>
              An admin needs to add at least one application before people can
              submit requests from the shared intake form.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
