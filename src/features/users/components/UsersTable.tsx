"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
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

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => fetchJson<UserRecord[]>("/api/users"),
    initialData: initialUsers,
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: Pick<UserRecord, "id" | "role">) =>
      fetchJson(`/api/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: async () => {
      toast.success("User role updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card>
      <CardContent className="overflow-hidden p-0">
        <table className="divide-border/80 min-w-full divide-y text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">GitLab</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-border/70 bg-panel divide-y">
            {usersQuery.data.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </td>
                <td className="text-muted-foreground px-5 py-4">
                  {user.gitlabUserId ?? "Not linked"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Badge tone={user.role === "admin" ? "accent" : "neutral"}>
                      {user.role}
                    </Badge>
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
                  </div>
                </td>
                <td className="text-muted-foreground px-5 py-4">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
