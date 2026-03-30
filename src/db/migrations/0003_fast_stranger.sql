CREATE TYPE "public"."ai_suggestion_status" AS ENUM('none', 'pending_review', 'accepted', 'dismissed');--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "ai_suggestion_status" "ai_suggestion_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "ai_triage" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "suspected_duplicate_ticket_id" uuid;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_suspected_duplicate_ticket_id_tickets_id_fk" FOREIGN KEY ("suspected_duplicate_ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tickets_ai_suggestion_status_idx" ON "tickets" USING btree ("ai_suggestion_status");--> statement-breakpoint
CREATE INDEX "tickets_suspected_duplicate_idx" ON "tickets" USING btree ("suspected_duplicate_ticket_id");