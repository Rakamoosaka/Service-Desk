import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type NewTicketAdminNotificationEmailProps = {
  applicationName: string;
  applicationSlug: string;
  ticketId: string;
  ticketType: "feedback" | "suggestion" | "bug";
  ticketTitle: string;
  ticketDescription: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedAt: string;
  serviceName?: string | null;
  ticketUrl: string;
};

export function NewTicketAdminNotificationEmail({
  applicationName,
  applicationSlug,
  ticketId,
  ticketType,
  ticketTitle,
  ticketDescription,
  submittedByName,
  submittedByEmail,
  submittedAt,
  serviceName,
  ticketUrl,
}: NewTicketAdminNotificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        New {ticketType} ticket for {applicationName}: {ticketTitle}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={panel}>
            <Text style={eyebrow}>Service Desk</Text>
            <Heading style={heading}>A new ticket needs review</Heading>
            <Text style={lede}>
              {submittedByName} submitted a new {ticketType} ticket for{" "}
              {applicationName}
              {serviceName ? ` / ${serviceName}` : ""}.
            </Text>

            <Section style={metaGrid}>
              <Text style={metaLabel}>Application</Text>
              <Text style={metaValue}>
                {applicationName} / {applicationSlug}
              </Text>
              <Text style={metaLabel}>Service</Text>
              <Text style={metaValue}>
                {serviceName ?? "Application-level ticket"}
              </Text>
              <Text style={metaLabel}>Submitted by</Text>
              <Text style={metaValue}>
                {submittedByName} ({submittedByEmail})
              </Text>
              <Text style={metaLabel}>Created</Text>
              <Text style={metaValue}>{submittedAt}</Text>
              <Text style={metaLabel}>Ticket ID</Text>
              <Text style={metaValue}>{ticketId}</Text>
            </Section>

            <Hr style={divider} />

            <Text style={sectionLabel}>Title</Text>
            <Text style={titleText}>{ticketTitle}</Text>

            <Text style={sectionLabel}>Description</Text>
            <Text style={descriptionText}>{ticketDescription}</Text>

            <Button href={ticketUrl} style={button}>
              Open ticket board
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0b1418",
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  margin: "0",
  padding: "32px 16px",
};

const container = {
  margin: "0 auto",
  maxWidth: "640px",
};

const panel = {
  backgroundColor: "#101b20",
  border: "1px solid #24333b",
  borderRadius: "18px",
  padding: "28px",
};

const eyebrow = {
  color: "#7ad4c2",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.24em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#f3f7f8",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.04em",
  lineHeight: "1.1",
  margin: "0 0 12px",
};

const lede = {
  color: "#c1d0d4",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 22px",
};

const metaGrid = {
  backgroundColor: "#0b1418",
  border: "1px solid #1d2b32",
  borderRadius: "14px",
  padding: "18px 20px",
};

const metaLabel = {
  color: "#7d9198",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const metaValue = {
  color: "#edf4f5",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const divider = {
  borderColor: "#223138",
  margin: "24px 0",
};

const sectionLabel = {
  color: "#7d9198",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const titleText = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 20px",
};

const descriptionText = {
  color: "#d5e0e2",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0 0 28px",
  whiteSpace: "pre-wrap" as const,
};

const button = {
  backgroundColor: "#8df3c7",
  borderRadius: "999px",
  color: "#082019",
  display: "inline-block",
  fontSize: "13px",
  fontWeight: "700",
  padding: "12px 18px",
  textDecoration: "none",
};
