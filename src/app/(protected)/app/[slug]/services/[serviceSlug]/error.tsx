"use client";

import { RouteErrorState } from "@/components/feedback/AsyncStates";

export default function ServiceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="The service detail view failed to load"
      description="We could not load the live health and ticket context for this service."
      onRetry={reset}
    />
  );
}
