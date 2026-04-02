import { AdminShell } from "@/app/(protected)/admin/_components/AdminShell";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell userName={session.user.name} userEmail={session.user.email}>
      {children}
    </AdminShell>
  );
}
