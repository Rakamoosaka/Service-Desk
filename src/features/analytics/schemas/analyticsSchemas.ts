import { z } from "zod";

export const analyticsRangeSchema = z.enum(["7d", "30d", "90d"]);

export const analyticsFiltersSchema = z.object({
  range: analyticsRangeSchema.optional(),
});

export type AnalyticsRange = z.infer<typeof analyticsRangeSchema>;
