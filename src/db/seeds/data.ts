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

export const seedApplications: SeedApplication[] = [];

export const seedServices: SeedService[] = [];

export const seedTickets: SeedTicket[] = [];
