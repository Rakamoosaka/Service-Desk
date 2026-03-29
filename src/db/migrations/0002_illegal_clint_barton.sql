ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "uptime_kuma_identifier" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "last_synced_at" timestamp with time zone;--> statement-breakpoint
UPDATE "applications"
SET "uptime_kuma_identifier" = COALESCE("uptime_kuma_identifier", "slug")
WHERE "uptime_kuma_identifier" IS NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "uptime_kuma_identifier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "kuma_monitor_id" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "kuma_monitor_name" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "last_synced_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_kuma_monitor_id_idx" ON "services" USING btree ("kuma_monitor_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "services_application_monitor_unique" ON "services" USING btree ("application_id","kuma_monitor_id");