"use client";

import { RouteErrorState } from "@/components/feedback/AsyncStates";

export default function ApplicationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="The application status view failed to load"
      description="We could not assemble the service and uptime data for this application."
      onRetry={reset}
    />
  );
}
