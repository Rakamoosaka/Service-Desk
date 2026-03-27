import { SectionIntro } from "@/components/layout/SectionIntro";
import { ApplicationsManager } from "@/features/applications/components/ApplicationsManager";
import { listApplicationsCached } from "@/features/applications/server/applicationService";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const applications = await listApplicationsCached();

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Application catalog"
        description="Create, update, and retire supported applications without leaving the protected workspace."
      />
      <ApplicationsManager initialApplications={applications} />
    </>
  );
}
