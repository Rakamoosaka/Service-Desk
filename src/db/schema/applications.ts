import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("applications_slug_idx").on(table.slug)],
);

export const applicationRelations = relations(applications, ({ many }) => ({
  services: many(services),
  tickets: many(tickets),
}));

import { services } from "@/db/schema/services";
import { tickets } from "@/db/schema/tickets";
