import { SectionIntro } from "@/components/layout/SectionIntro";
import { ServicesManager } from "@/features/services/components/ServicesManager";
import { listApplicationsCached } from "@/features/applications/server/applicationService";
import { listServicesCached } from "@/features/services/server/serviceService";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminServicesPage() {
  await requireAdmin();
  const [applications, services] = await Promise.all([
    listApplicationsCached(),
    listServicesCached(),
  ]);

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Service catalog"
        description="Map the microservices behind each application and attach their uptime monitor identifiers."
      />
      <ServicesManager
        initialApplications={applications}
        initialServices={services as never[]}
      />
    </>
  );
}
