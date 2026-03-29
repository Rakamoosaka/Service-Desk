import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { applications } from "@/db/schema/applications";
import { tickets } from "@/db/schema/tickets";

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    uptimeKumaIdentifier: text("uptime_kuma_identifier"),
    kumaMonitorId: text("kuma_monitor_id"),
    kumaMonitorName: text("kuma_monitor_name"),
    isActive: boolean("is_active").notNull().default(true),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("services_application_id_idx").on(table.applicationId),
    index("services_slug_idx").on(table.slug),
    index("services_kuma_monitor_id_idx").on(table.kumaMonitorId),
    uniqueIndex("services_application_slug_unique").on(
      table.applicationId,
      table.slug,
    ),
    uniqueIndex("services_application_monitor_unique").on(
      table.applicationId,
      table.kumaMonitorId,
    ),
  ],
);

export const serviceRelations = relations(services, ({ one, many }) => ({
  application: one(applications, {
    fields: [services.applicationId],
    references: [applications.id],
  }),
  tickets: many(tickets),
}));
