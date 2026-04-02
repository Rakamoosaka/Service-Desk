import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type TicketResponseEmailProps = {
  recipientName: string;
  applicationName: string;
  ticketTitle: string;
  ticketDescription: string;
  responseMessage: string;
};

export function TicketResponseEmail({
  recipientName,
  applicationName,
  ticketTitle,
  ticketDescription,
  responseMessage,
}: TicketResponseEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Update for your {applicationName} ticket: {ticketTitle}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={panel}>
            <Text style={eyebrow}>Service Desk</Text>
            <Heading style={heading}>Response to your ticket</Heading>
            <Text style={lede}>
              Hi {recipientName}, the team has responded to your support request
              for {applicationName}.
            </Text>

            <Text style={sectionLabel}>Ticket title</Text>
            <Text style={titleText}>{ticketTitle}</Text>

            <Text style={sectionLabel}>Original description</Text>
            <Text style={descriptionText}>{ticketDescription}</Text>

            <Hr style={divider} />

            <Text style={sectionLabel}>Response</Text>
            <Text style={responseText}>{responseMessage}</Text>
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
  backgroundColor: "#122027",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "32px",
};

const eyebrow = {
  color: "#86d4ff",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.22em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#f5fbff",
  fontSize: "28px",
  lineHeight: "1.2",
  margin: "0 0 16px",
};

const lede = {
  color: "#c8d5dc",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 24px",
};

const sectionLabel = {
  color: "#8ea3ad",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const titleText = {
  color: "#f5fbff",
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "1.45",
  margin: "0 0 20px",
};

const descriptionText = {
  color: "#d5e2e8",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0 0 24px",
  whiteSpace: "pre-wrap" as const,
};

const responseText = {
  color: "#f5fbff",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const divider = {
  borderColor: "rgba(255,255,255,0.08)",
  margin: "0 0 24px",
};
