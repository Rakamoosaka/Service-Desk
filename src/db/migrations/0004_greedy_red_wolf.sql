ALTER TABLE "tickets" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS ((
          setweight(to_tsvector('english', coalesce("tickets"."title", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("tickets"."description", '')), 'B')
        )) STORED;--> statement-breakpoint
CREATE INDEX "tickets_search_vector_idx" ON "tickets" USING gin ("search_vector");