import { SectionIntro } from "@/components/layout/SectionIntro";
import { ApplicationsManager } from "@/features/applications/components/ApplicationsManager";
import { listApplicationsWithServicesCached } from "@/features/applications/server/applicationService";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const applications = await listApplicationsWithServicesCached();

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Application catalog"
        description="Create supported applications, validate their Uptime Kuma identifier, and manage synced service labels from one page."
      />
      <ApplicationsManager initialApplications={applications} />
    </>
  );
}
