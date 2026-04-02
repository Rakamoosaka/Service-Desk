import { RouteLoadingState } from "@/components/feedback/AsyncStates";

export default function ApplicationLoading() {
  return (
    <RouteLoadingState
      eyebrow="Loading application"
      title="Building the status view"
      description="Collecting service health and uptime data for this application."
    />
  );
}
