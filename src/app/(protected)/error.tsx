"use client";

import { RouteErrorState } from "@/components/feedback/AsyncStates";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="This workspace view failed to load"
      description="The protected route hit an unexpected error while loading user or application data."
      onRetry={reset}
    />
  );
}
