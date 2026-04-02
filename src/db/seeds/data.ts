export const seedUsers = [
  {
    id: "seed-admin-1",
    name: "Avery Admin",
    email: "admin@example.com",
    role: "admin" as const,
    gitlabUserId: "123456",
  },
  {
    id: "seed-user-1",
    name: "Morgan User",
    email: "morgan@example.com",
    role: "user" as const,
    gitlabUserId: "654321",
  },
];

type SeedApplication = {
  name: string;
  slug: string;
  description: string;
  uptimeKumaIdentifier: string;
};

type SeedService = {
  applicationSlug: string;
  name: string;
  slug: string;
  description: string;
  uptimeKumaIdentifier?: string | null;
  kumaMonitorId?: string | null;
  kumaMonitorName?: string | null;
};

type SeedTicket = {
  applicationSlug: string;
  serviceSlug: string;
  type: "feedback" | "suggestion" | "bug";
  title: string;
  description: string;
  status: "new" | "in_review" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  duplicateGroup?: string;
};

type SeedTicketTemplate = Omit<SeedTicket, "createdAt">;

export const seedApplications: SeedApplication[] = [
  {
    name: "Test task",
    slug: "test-task",
    description:
      "Public Uptime Kuma-backed test application used to validate service monitoring and incident workflows.",
    uptimeKumaIdentifier: "test-task",
  },
];

export const seedServices: SeedService[] = [
  {
    applicationSlug: "test-task",
    name: "Test Monitor 1",
    slug: "test-monitor-1",
    description:
      "Seeded uptime-backed monitor used for incident and duplicate triage demos.",
    uptimeKumaIdentifier: "test-task",
    kumaMonitorId: "seed-monitor-1",
    kumaMonitorName: "Test Monitor 1",
  },
  {
    applicationSlug: "test-task",
    name: "Test Monitor 2",
    slug: "test-monitor-2",
    description:
      "Seeded monitor used to exercise alert noise, maintenance, and duplicate reporting flows.",
    uptimeKumaIdentifier: "test-task",
    kumaMonitorId: "seed-monitor-2",
    kumaMonitorName: "Test Monitor 2",
  },
];

const seedReferenceDate = new Date("2026-04-01T12:00:00.000Z");

const ticketVolumeByDay = [
  { daysAgo: 69, count: 1 },
  { daysAgo: 67, count: 2 },
  { daysAgo: 66, count: 1 },
  { daysAgo: 63, count: 3 },
  { daysAgo: 61, count: 2 },
  { daysAgo: 60, count: 1 },
  { daysAgo: 58, count: 4 },
  { daysAgo: 57, count: 3 },
  { daysAgo: 55, count: 1 },
  { daysAgo: 54, count: 5 },
  { daysAgo: 53, count: 4 },
  { daysAgo: 51, count: 3 },
  { daysAgo: 50, count: 2 },
  { daysAgo: 49, count: 5 },
  { daysAgo: 47, count: 4 },
  { daysAgo: 44, count: 1 },
  { daysAgo: 42, count: 2 },
  { daysAgo: 41, count: 1 },
  { daysAgo: 39, count: 2 },
  { daysAgo: 38, count: 1 },
  { daysAgo: 33, count: 6 },
  { daysAgo: 32, count: 4 },
  { daysAgo: 31, count: 5 },
  { daysAgo: 29, count: 3 },
  { daysAgo: 28, count: 4 },
  { daysAgo: 27, count: 6 },
  { daysAgo: 21, count: 2 },
  { daysAgo: 19, count: 3 },
  { daysAgo: 18, count: 2 },
  { daysAgo: 16, count: 3 },
  { daysAgo: 10, count: 4 },
  { daysAgo: 9, count: 3 },
  { daysAgo: 8, count: 2 },
  { daysAgo: 6, count: 3 },
  { daysAgo: 5, count: 1 },
  { daysAgo: 4, count: 1 },
];

const duplicateTitlePrefixes = [
  "Follow-up:",
  "Another report:",
  "Customer escalation:",
  "Duplicate alert:",
];

const duplicateDescriptionAdditions = [
  "This is surfacing again from a separate reporter and matches earlier symptoms closely.",
  "Support linked this to the same behavior pattern already seen in the queue.",
  "A different team described the same issue in slightly different words during triage.",
  "This looks materially identical to an earlier report and should help exercise duplicate detection.",
];

function buildSeedTimestamp(daysAgo: number, ticketIndex: number) {
  const createdAt = new Date(seedReferenceDate);

  createdAt.setUTCDate(createdAt.getUTCDate() - daysAgo);
  createdAt.setUTCHours(8 + (ticketIndex % 9), (ticketIndex * 17) % 60, 0, 0);

  return createdAt;
}

function expandTicketDays() {
  return ticketVolumeByDay.flatMap(({ daysAgo, count }) =>
    Array.from({ length: count }, () => daysAgo),
  );
}

const seedTicketTemplates: SeedTicketTemplate[] = [
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "feedback",
    title:
      "Test Monitor 1 stays green publicly while users hit repeated timeouts",
    description:
      "The status page still shows Test Monitor 1 as operational, but users are reporting repeated request timeouts against the service. This mismatch is causing confusion during incident response because the public signal looks healthy while real traffic is failing.",
    status: "new",
    priority: "high",
    duplicateGroup: "false-green-monitor-1",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "bug",
    title:
      "Customers see Test Monitor 1 as up, but their calls keep timing out anyway",
    description:
      "I can reproduce a case where Test Monitor 1 is still marked healthy on the public page while real requests time out for several minutes. This looks like the same incident others reported because the visible status never flips even though the service is unavailable.",
    status: "in_review",
    priority: "high",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "bug",
    title: "Need a planned maintenance mode for Test Monitor 2 alerts",
    description:
      "We need a way to mark Test Monitor 2 as under planned maintenance so expected downtime does not trigger incident noise. This is more of a product workflow improvement than a broken production bug.",
    status: "new",
    priority: "medium",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "suggestion",
    title:
      "Add maintenance windows to Test Monitor 2 so expected outages stay quiet",
    description:
      "Planned deploys on Test Monitor 2 still generate the same alerts as real incidents. A maintenance-window option would keep the monitor useful without spamming the queue during expected work.",
    status: "new",
    priority: "medium",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "bug",
    title:
      "Incident export cuts off the final outage note for Test Monitor 1 timelines",
    description:
      "When we export incidents tied to Test Monitor 1, the detailed outage note is truncated before the recovery summary. That makes the exported timeline incomplete during postmortems.",
    status: "new",
    priority: "medium",
    duplicateGroup: "incident-export-monitor-1",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "feedback",
    title:
      "Exported Test Monitor 1 incident notes are getting chopped mid-summary",
    description:
      "The export finishes, but the longest Test Monitor 1 incident entries stop halfway through the note. We lose the exact recovery details, which makes the exported report hard to trust.",
    status: "in_review",
    priority: "medium",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "feedback",
    title:
      "Test Monitor 2 badge color is a little too subtle on the status page",
    description:
      "The monitor badge for Test Monitor 2 blends into the page background on my screen. It is still readable, so this feels cosmetic rather than urgent.",
    status: "resolved",
    priority: "low",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "suggestion",
    title:
      "Show likely duplicate monitor tickets inline before an admin opens one",
    description:
      "A lightweight duplicate hint in the monitor ticket list would help prevent repeated triage when several people file the same Test Monitor 2 issue. A subtle indicator plus quick review access would be enough.",
    status: "new",
    priority: "low",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "bug",
    title:
      "Test Monitor 2 recovery alerts are sending twice to the same channel",
    description:
      "Every time Test Monitor 2 recovers, the same recovery alert is delivered twice within a few seconds. This is happening consistently and creating noise in the incident channel.",
    status: "new",
    priority: "high",
    duplicateGroup: "duplicate-recovery-monitor-2",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "feedback",
    title: "The same Test Monitor 2 recovery notice keeps arriving twice",
    description:
      "We saw the same Test Monitor 2 recovery notification hit the same recipients twice during the last outage. This looks like the same duplicate-delivery problem others are already reporting.",
    status: "in_review",
    priority: "high",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "feedback",
    title:
      "Allow temporary alert muting for Test Monitor 2 during planned deploys",
    description:
      "During scheduled work on Test Monitor 2 we still send the same noisy alerts as a real outage. A temporary mute or maintenance setting would reduce alert fatigue without disabling the monitor completely.",
    status: "new",
    priority: "medium",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "bug",
    title:
      "Test Monitor 1 history panel times out when the incident chain gets very long",
    description:
      "If Test Monitor 1 has a long history of incidents, the timeline view hangs for several seconds and eventually fails to render. This blocks incident review and makes the monitor history hard to use.",
    status: "new",
    priority: "high",
    duplicateGroup: "history-timeout-monitor-1",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "feedback",
    title:
      "Pressing escape in the Test Monitor 2 incident note modal closes it and loses the draft",
    description:
      "I was halfway through writing an incident note for Test Monitor 2 and accidentally hit escape. The modal closed immediately and the draft disappeared, so I had to retype the whole update.",
    status: "new",
    priority: "medium",
    duplicateGroup: "draft-loss-monitor-2",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "bug",
    title:
      "Incident note dialog for Test Monitor 2 dismisses on escape and wipes typed text",
    description:
      "The incident note flow should not throw away work on a single escape key press. Right now the dialog closes and the user loses everything they wrote for the Test Monitor 2 update.",
    status: "in_review",
    priority: "medium",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "suggestion",
    title: "Add explicit owner and escalation fields to monitor tickets",
    description:
      "We need a simple owner field on monitor tickets so each Test Monitor 1 or 2 incident has a visible accountable person. This would improve handoff during busy response windows.",
    status: "new",
    priority: "medium",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-2",
    type: "feedback",
    title:
      "Searching monitor tickets by service name would make incident reviews much faster",
    description:
      "The queue is manageable now, but searching by monitor name or monitor ID would save time during incident review. This is a workflow improvement rather than a service breakage.",
    status: "new",
    priority: "low",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "bug",
    title:
      "Rapid state changes on Test Monitor 1 can revert an incident back to investigating",
    description:
      "When responders change Test Monitor 1 from investigating to resolved and immediately touch another entry, the first incident sometimes snaps back to investigating after the update settles. This causes real confusion during triage.",
    status: "new",
    priority: "high",
    duplicateGroup: "state-revert-monitor-1",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "bug",
    title:
      "Quick successive monitor updates can push Test Monitor 1 back into investigating unexpectedly",
    description:
      "The incident queue appears to race when multiple Test Monitor 1 state changes happen in a row. A monitor that looked resolved reverted to investigating after the mutation finished.",
    status: "in_review",
    priority: "high",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "feedback",
    title:
      "The Test task page goes blank when the status page cannot be reached",
    description:
      "If the public status page is slow or unavailable, the Test task application page can render a blank section instead of a fallback message. People think the app itself is down when this happens.",
    status: "new",
    priority: "high",
    duplicateGroup: "blank-fallback-test-task",
  },
  {
    applicationSlug: "test-task",
    serviceSlug: "test-monitor-1",
    type: "suggestion",
    title: "Save recurring filter presets for the Test Monitor 1 and 2 queues",
    description:
      "Responders review the same slices of the monitor queue every morning. Saved filters for service, status, and ticket type would make that workflow faster.",
    status: "resolved",
    priority: "low",
  },
];

const expandedTicketDays = expandTicketDays();

if (expandedTicketDays.length !== 100) {
  throw new Error(
    `Expected 100 ticket timestamps, received ${expandedTicketDays.length}`,
  );
}

export const seedTickets: SeedTicket[] = expandedTicketDays.map(
  (daysAgo, index) => {
    const template = seedTicketTemplates[index % seedTicketTemplates.length];
    const occurrence = Math.floor(index / seedTicketTemplates.length);
    const duplicatePrefix =
      occurrence > 0
        ? `${duplicateTitlePrefixes[(occurrence - 1) % duplicateTitlePrefixes.length]} `
        : "";
    const duplicateDescription =
      occurrence > 0
        ? ` ${duplicateDescriptionAdditions[(occurrence - 1) % duplicateDescriptionAdditions.length]}`
        : "";

    return {
      ...template,
      title: `${duplicatePrefix}${template.title}`,
      description: `${template.description}${duplicateDescription}`,
      createdAt: buildSeedTimestamp(daysAgo, index),
    };
  },
);
