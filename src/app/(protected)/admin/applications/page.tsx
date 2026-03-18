import { ApplicationsManager } from "@/features/applications/components/ApplicationsManager";
import { listApplicationsCached } from "@/features/applications/server/applicationService";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const applications = await listApplicationsCached();

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Service catalog"
        description="Create, update, and retire supported applications without leaving the protected workspace."
      />
      <ApplicationsManager initialApplications={applications} />
    </>
  );
}
