import type { QueryClient, QueryKey } from "@tanstack/react-query";

export interface OptimisticQueryContext<TData> {
  previous: TData | undefined;
}

interface OptimisticQueryUpdateOptions<TData> {
  queryClient: QueryClient;
  queryKey: QueryKey;
  updater: (current: TData | undefined) => TData;
}

interface RollbackOptimisticQueryOptions<TData> {
  queryClient: QueryClient;
  queryKey: QueryKey;
  context: OptimisticQueryContext<TData> | undefined;
}

export async function optimisticQueryUpdate<TData>({
  queryClient,
  queryKey,
  updater,
}: OptimisticQueryUpdateOptions<TData>): Promise<
  OptimisticQueryContext<TData>
> {
  await queryClient.cancelQueries({ queryKey });

  const previous = queryClient.getQueryData<TData>(queryKey);

  queryClient.setQueryData<TData>(queryKey, updater);

  return { previous };
}

export function rollbackOptimisticQueryUpdate<TData>({
  queryClient,
  queryKey,
  context,
}: RollbackOptimisticQueryOptions<TData>) {
  if (!context) {
    return;
  }

  queryClient.setQueryData<TData | undefined>(queryKey, context.previous);
}
