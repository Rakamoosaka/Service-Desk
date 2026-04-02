import { RouteLoadingState } from "@/components/feedback/AsyncStates";

export default function ServiceLoading() {
  return (
    <RouteLoadingState
      eyebrow="Loading service"
      title="Preparing the service detail view"
      description="Fetching service health, ticket activity, and live uptime data."
    />
  );
}
