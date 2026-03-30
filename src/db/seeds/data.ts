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

type SeedTicket = {
  applicationSlug: string;
  serviceSlug: string;
  type: "feedback" | "suggestion" | "bug";
  title: string;
  description: string;
  status: "new" | "in_review" | "resolved";
  priority: "low" | "medium" | "high";
};

export const seedApplications: SeedApplication[] = [
  {
    name: "Test task",
    slug: "test-task",
    description:
      "Public Uptime Kuma-backed test application used to validate service monitoring and incident workflows.",
    uptimeKumaIdentifier: "test-task",
  },
];

export const seedTickets: SeedTicket[] = [
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
