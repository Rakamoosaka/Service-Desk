import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { TicketResponseEmail } from "@/features/tickets/components/emails/TicketResponseEmail";

type SendTicketResponseEmailInput = {
  applicationName: string;
  ticketTitle: string;
  ticketDescription: string;
  responseMessage: string;
  submittedBy: {
    name: string;
    email: string;
  };
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

function resolveDeliveryErrorMessage(error: {
  message?: string;
  name?: string;
  statusCode?: number;
}) {
  const message = error.message?.trim();

  if (
    error.statusCode === 403 &&
    message?.includes(
      "You can only send testing emails to your own email address",
    )
  ) {
    return "Resend is still in testing mode. Verify a domain in Resend and set RESEND_FROM_EMAIL to that verified domain before sending replies to other users.";
  }

  return message || "Failed to send email response";
}

export async function sendTicketResponseEmail({
  applicationName,
  ticketTitle,
  ticketDescription,
  responseMessage,
  submittedBy,
}: SendTicketResponseEmailInput) {
  const resend = getResendClient();

  if (!resend || !env.RESEND_FROM_EMAIL) {
    throw new Error("Email delivery is not configured");
  }

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [submittedBy.email.trim()],
    subject: `[${applicationName}] Response to your ticket`,
    react: (
      <TicketResponseEmail
        recipientName={submittedBy.name}
        applicationName={applicationName}
        ticketTitle={ticketTitle}
        ticketDescription={ticketDescription}
        responseMessage={responseMessage}
      />
    ),
  });

  if (error) {
    console.error("Failed to send ticket response email", error);
    throw new Error(resolveDeliveryErrorMessage(error));
  }
}
