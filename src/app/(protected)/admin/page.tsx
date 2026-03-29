import { SectionIntro } from "@/components/layout/SectionIntro";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import { getAnalyticsDashboard } from "@/features/analytics/server/analyticsService";
import { analyticsRangeSchema } from "@/features/analytics/schemas/analyticsSchemas";
import { requireAdmin } from "@/lib/auth/session";

interface AdminOverviewPageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function AdminOverviewPage({
  searchParams,
}: AdminOverviewPageProps) {
  await requireAdmin();

  const { range: rangeParam } = await searchParams;
  const range = analyticsRangeSchema.safeParse(rangeParam).success
    ? analyticsRangeSchema.parse(rangeParam)
    : "30d";

  const analytics = await getAnalyticsDashboard(range);

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Operational overview"
        description="Use this dashboard to track ticket volume, review backlog, and see where support work is building up."
      />

      <AnalyticsDashboard range={range} data={analytics} />
    </>
  );
}
