import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminServicesPage() {
  await requireAdmin();
  redirect("/admin/applications");
}
