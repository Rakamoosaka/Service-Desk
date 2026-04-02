import { RouteLoadingState } from "@/components/feedback/AsyncStates";

export default function AdminLoading() {
  return (
    <RouteLoadingState
      eyebrow="Loading admin"
      title="Preparing the admin workspace"
      description="Fetching analytics, catalog, ticket, and user data for the admin area."
    />
  );
}
