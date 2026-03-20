import { count, desc, eq, gte, or } from "drizzle-orm";
import { db } from "@/db";
import { applications, tickets, users } from "@/db/schema";
import type { AnalyticsRange } from "@/features/analytics/schemas/analyticsSchemas";

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const TICKET_STATUSES = ["new", "in_review", "resolved", "closed"] as const;

type TicketStatus = (typeof TICKET_STATUSES)[number];

interface AnalyticsTicketRecord {
  id: string;
  status: TicketStatus;
  createdAt: Date;
  application: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AnalyticsSummary {
  range: AnalyticsRange;
  days: number;
  totals: {
    totalTickets: number;
    ticketsInRange: number;
    backlogTickets: number;
    totalApplications: number;
    totalUsers: number;
    applicationsWithActivity: number;
    averageTicketsPerDay: number;
  };
  ticketsPerApplication: Array<{
    applicationId: string;
    name: string;
    slug: string;
    ticketCount: number;
    share: number;
    statuses: Array<{
      status: TicketStatus;
      value: number;
    }>;
  }>;
}

export interface AnalyticsTrendPoint {
  date: string;
  label: string;
  value: number;
}

export interface AnalyticsStatusDistributionEntry {
  status: TicketStatus;
  value: number;
  share: number;
}

export interface AnalyticsDashboard {
  summary: AnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  statusDistribution: AnalyticsStatusDistributionEntry[];
}

function getRangeStart(range: AnalyticsRange) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (RANGE_DAYS[range] - 1));
  return date;
}

function toUtcDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}

function buildDateKeys(start: Date, totalDays: number) {
  return Array.from({ length: totalDays }, (_, index) => {
    const nextDate = new Date(start);
    nextDate.setUTCDate(start.getUTCDate() + index);
    return toUtcDateKey(nextDate);
  });
}

function buildStatusCounts() {
  return {
    new: 0,
    in_review: 0,
    resolved: 0,
    closed: 0,
  } satisfies Record<TicketStatus, number>;
}

async function listTicketsInRange(range: AnalyticsRange) {
  return db.query.tickets.findMany({
    where: gte(tickets.createdAt, getRangeStart(range)),
    orderBy: [desc(tickets.createdAt)],
    columns: {
      id: true,
      status: true,
      createdAt: true,
    },
    with: {
      application: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  }) as Promise<AnalyticsTicketRecord[]>;
}

function buildTrend(
  range: AnalyticsRange,
  analyticsTickets: AnalyticsTicketRecord[],
) {
  const rangeStart = getRangeStart(range);
  const rangeDays = RANGE_DAYS[range];
  const dayKeys = buildDateKeys(rangeStart, rangeDays);
  const trendMap = new Map(dayKeys.map((dayKey) => [dayKey, 0]));

  for (const ticket of analyticsTickets) {
    const dayKey = toUtcDateKey(ticket.createdAt);
    trendMap.set(dayKey, (trendMap.get(dayKey) ?? 0) + 1);
  }

  return dayKeys.map((dayKey) => ({
    date: dayKey,
    label: formatDayLabel(dayKey),
    value: trendMap.get(dayKey) ?? 0,
  }));
}

function buildStatusDistribution(analyticsTickets: AnalyticsTicketRecord[]) {
  const totals = buildStatusCounts();

  for (const ticket of analyticsTickets) {
    totals[ticket.status] += 1;
  }

  const totalTickets = analyticsTickets.length;

  return TICKET_STATUSES.map((status) => ({
    status,
    value: totals[status],
    share: totalTickets
      ? Number(((totals[status] / totalTickets) * 100).toFixed(1))
      : 0,
  }));
}

function buildTicketsPerApplication(analyticsTickets: AnalyticsTicketRecord[]) {
  const ticketCount = analyticsTickets.length;
  const applicationsMap = new Map<
    string,
    {
      applicationId: string;
      name: string;
      slug: string;
      ticketCount: number;
      statuses: Record<TicketStatus, number>;
    }
  >();

  for (const ticket of analyticsTickets) {
    const current = applicationsMap.get(ticket.application.id) ?? {
      applicationId: ticket.application.id,
      name: ticket.application.name,
      slug: ticket.application.slug,
      ticketCount: 0,
      statuses: buildStatusCounts(),
    };

    current.ticketCount += 1;
    current.statuses[ticket.status] += 1;
    applicationsMap.set(ticket.application.id, current);
  }

  return [...applicationsMap.values()]
    .sort((left, right) => right.ticketCount - left.ticketCount)
    .map((application) => ({
      ...application,
      share: ticketCount
        ? Number(((application.ticketCount / ticketCount) * 100).toFixed(1))
        : 0,
      statuses: TICKET_STATUSES.map((status) => ({
        status,
        value: application.statuses[status],
      })),
    }));
}

export async function getAnalyticsSummary(
  range: AnalyticsRange,
): Promise<AnalyticsSummary> {
  const [
    analyticsTickets,
    [ticketTotals],
    [applicationTotals],
    [userTotals],
    [backlogTotals],
  ] = await Promise.all([
    listTicketsInRange(range),
    db.select({ value: count() }).from(tickets),
    db.select({ value: count() }).from(applications),
    db.select({ value: count() }).from(users),
    db
      .select({ value: count() })
      .from(tickets)
      .where(or(eq(tickets.status, "new"), eq(tickets.status, "in_review"))),
  ]);

  const days = RANGE_DAYS[range];

  return {
    range,
    days,
    totals: {
      totalTickets: ticketTotals?.value ?? 0,
      ticketsInRange: analyticsTickets.length,
      backlogTickets: backlogTotals?.value ?? 0,
      totalApplications: applicationTotals?.value ?? 0,
      totalUsers: userTotals?.value ?? 0,
      applicationsWithActivity: new Set(
        analyticsTickets.map((ticket) => ticket.application.id),
      ).size,
      averageTicketsPerDay: Number((analyticsTickets.length / days).toFixed(1)),
    },
    ticketsPerApplication: buildTicketsPerApplication(analyticsTickets),
  };
}

export async function getTicketTrend(range: AnalyticsRange) {
  const analyticsTickets = await listTicketsInRange(range);
  return buildTrend(range, analyticsTickets);
}

export async function getStatusDistribution(range: AnalyticsRange) {
  const analyticsTickets = await listTicketsInRange(range);
  return buildStatusDistribution(analyticsTickets);
}

export async function getAnalyticsDashboard(
  range: AnalyticsRange,
): Promise<AnalyticsDashboard> {
  const analyticsTickets = await listTicketsInRange(range);
  const [[ticketTotals], [applicationTotals], [userTotals], [backlogTotals]] =
    await Promise.all([
      db.select({ value: count() }).from(tickets),
      db.select({ value: count() }).from(applications),
      db.select({ value: count() }).from(users),
      db
        .select({ value: count() })
        .from(tickets)
        .where(or(eq(tickets.status, "new"), eq(tickets.status, "in_review"))),
    ]);

  const days = RANGE_DAYS[range];

  return {
    summary: {
      range,
      days,
      totals: {
        totalTickets: ticketTotals?.value ?? 0,
        ticketsInRange: analyticsTickets.length,
        backlogTickets: backlogTotals?.value ?? 0,
        totalApplications: applicationTotals?.value ?? 0,
        totalUsers: userTotals?.value ?? 0,
        applicationsWithActivity: new Set(
          analyticsTickets.map((ticket) => ticket.application.id),
        ).size,
        averageTicketsPerDay: Number(
          (analyticsTickets.length / days).toFixed(1),
        ),
      },
      ticketsPerApplication: buildTicketsPerApplication(analyticsTickets),
    },
    trend: buildTrend(range, analyticsTickets),
    statusDistribution: buildStatusDistribution(analyticsTickets),
  };
}
