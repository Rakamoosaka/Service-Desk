import { count } from "drizzle-orm";
import { db } from "@/db";
import { applications, tickets, users } from "@/db/schema";

export async function getDashboardMetrics() {
  const [[ticketTotals], [applicationTotals], [userTotals]] = await Promise.all(
    [
      db.select({ value: count() }).from(tickets),
      db.select({ value: count() }).from(applications),
      db.select({ value: count() }).from(users),
    ],
  );

  const distribution = await db
    .select({
      status: tickets.status,
      value: count(),
    })
    .from(tickets)
    .groupBy(tickets.status)
    .orderBy(tickets.status);

  return {
    ticketCount: ticketTotals?.value ?? 0,
    applicationCount: applicationTotals?.value ?? 0,
    userCount: userTotals?.value ?? 0,
    distribution,
  };
}
