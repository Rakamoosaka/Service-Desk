import { SectionIntro } from "@/components/layout/SectionIntro";
import { listApplications } from "@/features/applications/server/applicationService";
import { AdminTicketsBoard } from "@/features/tickets/components/AdminTicketsBoard";
import { listTickets } from "@/features/tickets/server/ticketService";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminTicketsPage() {
  await requireAdmin();
  const [tickets, applications] = await Promise.all([
    listTickets(),
    listApplications(),
  ]);

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Ticket operations"
        description="Filter the queue, review incoming reports, and update ticket status with optimistic UI feedback."
      />
      <AdminTicketsBoard
        initialTickets={tickets as never[]}
        applications={applications.map((application) => ({
          id: application.id,
          name: application.name,
        }))}
      />
    </>
  );
}
