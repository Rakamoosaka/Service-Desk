import { RouteLoadingState } from "@/components/feedback/AsyncStates";

export default function ProtectedLoading() {
  return (
    <RouteLoadingState
      eyebrow="Loading workspace"
      title="Preparing the service desk"
      description="Checking access and loading the latest application, ticket, and uptime context."
    />
  );
}
