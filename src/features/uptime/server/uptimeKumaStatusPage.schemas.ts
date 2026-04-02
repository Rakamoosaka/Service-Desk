import { z } from "zod";

export const preloadDataSchema = z.object({
  config: z.object({
    title: z.string().nullable().optional(),
    autoRefreshInterval: z.number().int().positive().optional(),
  }),
  incident: z
    .object({
      id: z.number(),
      title: z.string(),
      content: z.string().nullable().optional(),
      createdDate: z.string().nullable().optional(),
      lastUpdatedDate: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  publicGroupList: z
    .array(
      z.object({
        name: z.string(),
        monitorList: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            type: z.string().optional(),
          }),
        ),
      }),
    )
    .default([]),
});

export const heartbeatPayloadSchema = z.object({
  heartbeatList: z.record(
    z.string(),
    z.array(
      z.object({
        status: z.number(),
        time: z.string(),
        msg: z.string().optional().default(""),
        ping: z.number().nullable().optional(),
      }),
    ),
  ),
  uptimeList: z.record(z.string(), z.number()).default({}),
});

export const preloadDataPattern = /window\.preloadData = (\{[\s\S]*?\});/;

export type UptimeKumaPreloadData = z.infer<typeof preloadDataSchema>;
export type UptimeKumaHeartbeatPayload = z.infer<typeof heartbeatPayloadSchema>;
