import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { listAdminNotificationRecipients } from "@/features/users/server/userService";
import { NewTicketAdminNotificationEmail } from "@/features/tickets/components/emails/NewTicketAdminNotificationEmail";

type NotificationTicket = {
  id: string;
  title: string;
  description: string;
  type: "feedback" | "suggestion" | "bug";
  createdAt: Date;
};

type NotificationApplication = {
  id: string;
  name: string;
  slug: string;
};

type NotificationService = {
  id: string;
  name: string;
  slug: string;
} | null;

type NotificationUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SendNewTicketAdminNotificationInput = {
  ticket: NotificationTicket;
  application: NotificationApplication;
  service: NotificationService;
  submittedBy: NotificationUser;
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

function getAdminTicketBoardUrl() {
  return new URL("/admin/tickets", env.NEXT_PUBLIC_APP_URL).toString();
}

function getNotificationRecipients(recipientEmails: string[]) {
  if (env.RESEND_TEST_EMAIL) {
    return [env.RESEND_TEST_EMAIL];
  }

  return recipientEmails;
}

export async function sendNewTicketAdminNotification({
  ticket,
  application,
  service,
  submittedBy,
}: SendNewTicketAdminNotificationInput) {
  const resend = getResendClient();

  if (!resend || !env.RESEND_FROM_EMAIL) {
    return;
  }

  const recipients = await listAdminNotificationRecipients();
  const recipientEmails = recipients
    .map((recipient) => recipient.email.trim())
    .filter(Boolean);
  const deliverTo = Array.from(
    new Set(getNotificationRecipients(recipientEmails)),
  );

  if (!deliverTo.length) {
    return;
  }

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: deliverTo,
    subject: `[${application.name}] New ${ticket.type} ticket`,
    react: (
      <NewTicketAdminNotificationEmail
        applicationName={application.name}
        applicationSlug={application.slug}
        ticketId={ticket.id}
        ticketType={ticket.type}
        ticketTitle={ticket.title}
        ticketDescription={ticket.description}
        submittedByName={submittedBy.name}
        submittedByEmail={submittedBy.email}
        submittedAt={ticket.createdAt.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
        serviceName={service?.name ?? null}
        ticketUrl={getAdminTicketBoardUrl()}
      />
    ),
  });

  if (error) {
    console.error("Failed to send new ticket admin notification", error);
  }
}
