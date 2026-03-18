import { SectionIntro } from "@/components/layout/SectionIntro";
import { AdminTicketsBoard } from "@/features/tickets/components/AdminTicketsBoard";
import { listTickets } from "@/features/tickets/server/ticketService";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminTicketsPage() {
  await requireAdmin();
  const tickets = await listTickets();

  return (
    <>
      <SectionIntro
        eyebrow="Admin"
        title="Ticket operations"
        description="Filter the queue, review incoming reports, and update ticket status with optimistic UI feedback."
      />
      <AdminTicketsBoard initialTickets={tickets as never[]} />
    </>
  );
}
