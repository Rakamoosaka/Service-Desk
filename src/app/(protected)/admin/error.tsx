"use client";

import { RouteErrorState } from "@/components/feedback/AsyncStates";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="The admin workspace failed to load"
      description="One of the admin data requests failed before the page could finish rendering."
      onRetry={reset}
    />
  );
}
