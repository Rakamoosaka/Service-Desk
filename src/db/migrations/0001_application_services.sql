CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"uptime_kuma_identifier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "services_application_id_idx" ON "services" USING btree ("application_id");
--> statement-breakpoint
CREATE INDEX "services_slug_idx" ON "services" USING btree ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX "services_application_slug_unique" ON "services" USING btree ("application_id","slug");
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "service_id" uuid;
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "tickets_service_id_idx" ON "tickets" USING btree ("service_id");
--> statement-breakpoint
INSERT INTO "services" (
	"application_id",
	"name",
	"slug",
	"description",
	"uptime_kuma_identifier"
)
SELECT
	"id",
	"name",
	"slug",
	"description",
	"uptime_kuma_identifier"
FROM "applications";
--> statement-breakpoint
UPDATE "tickets" AS "t"
SET "service_id" = "s"."id"
FROM "services" AS "s"
WHERE "s"."application_id" = "t"."app_id";
--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "uptime_kuma_identifier";