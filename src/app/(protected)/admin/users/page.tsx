import { SectionIntro } from "@/components/layout/SectionIntro";
import { UsersTable } from "@/features/users/components/UsersTable";
import { listUsers } from "@/features/users/server/userService";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Access and roles"
        description="Promote or demote authenticated GitLab users after their initial provisioning."
      />
      <UsersTable initialUsers={users as never[]} />
    </>
  );
}
