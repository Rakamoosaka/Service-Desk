import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { applications } from "@/db/schema/applications";
import { users } from "@/db/schema/auth";

export const ticketTypeEnum = pgEnum("ticket_type", [
  "feedback",
  "suggestion",
  "bug",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "new",
  "in_review",
  "resolved",
  "closed",
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "critical",
  "unknown",
]);
export const analysisStateEnum = pgEnum("analysis_state", [
  "not_requested",
  "pending",
  "completed",
  "failed",
]);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appId: uuid("app_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    type: ticketTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: ticketStatusEnum("status").notNull().default("new"),
    priority: ticketPriorityEnum("priority").notNull().default("unknown"),
    submittedByUserId: text("submitted_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    analysisState: analysisStateEnum("analysis_state")
      .notNull()
      .default("not_requested"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tickets_app_id_idx").on(table.appId),
    index("tickets_status_idx").on(table.status),
    index("tickets_type_idx").on(table.type),
    index("tickets_app_status_idx").on(table.appId, table.status),
    index("tickets_app_created_idx").on(table.appId, table.createdAt),
  ],
);

export const ticketRelations = relations(tickets, ({ one }) => ({
  application: one(applications, {
    fields: [tickets.appId],
    references: [applications.id],
  }),
  submittedBy: one(users, {
    fields: [tickets.submittedByUserId],
    references: [users.id],
  }),
}));
