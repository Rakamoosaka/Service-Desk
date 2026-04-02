"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
  TableSkeleton,
} from "@/components/feedback/AsyncStates";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import {
  optimisticQueryUpdate,
  rollbackOptimisticQueryUpdate,
} from "@/lib/query/optimistic";
import { formatDate } from "@/lib/utils";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  gitlabUserId: string | null;
  createdAt: string;
};

interface UsersTableProps {
  initialUsers: UserRecord[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const queryClient = useQueryClient();
  const usersQueryKey = queryKeys.users;

  const usersQuery = useQuery({
    queryKey: usersQueryKey,
    queryFn: () => fetchJson<UserRecord[]>("/api/users"),
    initialData: initialUsers,
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: Pick<UserRecord, "id" | "role">) =>
      fetchJson<UserRecord>(`/api/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onMutate: ({ id, role }) =>
      optimisticQueryUpdate<UserRecord[]>({
        queryClient,
        queryKey: usersQueryKey,
        updater: (current) =>
          current?.map((user) => (user.id === id ? { ...user, role } : user)) ??
          [],
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<UserRecord[]>(
        usersQueryKey,
        (current) =>
          current?.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ) ?? [],
      );

      toast.success("User role updated");
    },
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: usersQueryKey,
        context,
      });

      toast.error(error.message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });

  const users = usersQuery.data ?? [];

  return (
    <Card>
      <CardContent className="space-y-4 overflow-hidden p-0">
        {usersQuery.isFetching ? (
          <div className="px-5 pt-5 md:px-6 md:pt-6">
            <InlineNotice
              title="Refreshing users"
              description="Latest user records and role assignments are being fetched in the background."
            />
          </div>
        ) : null}

        {usersQuery.isError && users.length > 0 ? (
          <div className="px-5 pt-5 md:px-6 md:pt-6">
            <InlineNotice
              tone="danger"
              title="Background refresh failed"
              description={usersQuery.error.message}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => usersQuery.refetch()}
                >
                  Retry fetch
                </Button>
              }
            />
          </div>
        ) : null}

        {usersQuery.isLoading && users.length === 0 ? (
          <div className="p-6 md:p-7">
            <div className="space-y-4">
              <LoadingState
                title="Loading users"
                description="Fetching the latest provisioned users and role assignments."
              />
              <TableSkeleton
                columns={4}
                columnTemplate="minmax(15rem,1.4fr) minmax(10rem,1fr) minmax(8rem,0.7fr) minmax(8rem,0.8fr)"
                rows={5}
                headerWidths={["26%", "36%", "28%", "30%"]}
                bodyWidths={["72%", "64%", "58%", "52%"]}
                secondaryLineColumns={[0]}
                secondaryLineWidths={["46%"]}
              />
            </div>
          </div>
        ) : null}

        {usersQuery.isError && users.length === 0 ? (
          <div className="p-6 md:p-7">
            <ErrorState
              title="Unable to load users"
              description={usersQuery.error.message}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => usersQuery.refetch()}
                >
                  Retry fetch
                </Button>
              }
            />
          </div>
        ) : null}

        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
          <div className="p-6 md:p-7">
            <EmptyState
              title="No users have been provisioned yet"
              description="User records will appear here after someone signs in through GitLab for the first time."
            />
          </div>
        ) : null}

        {users.length > 0 ? (
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="divide-border w-full min-w-[42rem] divide-y text-left text-[13px]">
              <thead className="bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    User
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    GitLab
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Role
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border bg-panel divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/35">
                    <td className="px-4 py-3.5">
                      <p className="text-foreground text-[13px] font-semibold">
                        {user.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    </td>
                    <td className="text-muted-foreground px-4 py-3.5">
                      {user.gitlabUserId ?? "Not linked"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Select
                        className="min-w-32"
                        value={user.role}
                        onChange={(event) =>
                          roleMutation.mutate({
                            id: user.id,
                            role: event.target.value as UserRecord["role"],
                          })
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </td>
                    <td className="text-muted-foreground px-4 py-3.5">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
