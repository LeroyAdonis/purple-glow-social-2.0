-- Migration: Prepaid ZAR credit wallet — append-only ledger (S1 / DIG-46)
--
-- WHY THIS IS HAND-WRITTEN AND NOT `drizzle-kit generate`:
-- The generated migration for this change recreated EVERY enum and table in the schema, because the live
-- database was built with `drizzle-kit push` and the migration journal does not describe the real object set.
-- Applying that file would either fail on existing objects or, if it ran, be destructive. This file adds only
-- what is missing. The journal/schema drift is a separate finding and must be repaired before the next
-- generated migration is trusted.
--
-- The ledger is APPEND-ONLY by design: there is no updated_at column, because a row that can be updated is not
-- a ledger entry. Balance is SUM(delta) over a user's rows; there is no mutable balance column anywhere.
--
-- delta is in CENTS and may be negative (publish deductions). DWT is not VAT registered: R299 is R299.

CREATE TABLE IF NOT EXISTS "credit_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "delta" integer NOT NULL,
  "reason" text NOT NULL,
  "ref" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'credit_entries_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "credit_entries"
      ADD CONSTRAINT "credit_entries_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- Every balance read and every history view filters by user and orders by time.
CREATE INDEX IF NOT EXISTS "idx_credit_entries_user_created_at"
  ON "credit_entries" USING btree ("user_id", "created_at");

-- A publish deduction must never be recorded twice for the same post. Top-ups are guarded in application code
-- by the Paystack idempotency key; this partial unique index is the database-level guard for deductions.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_credit_entries_publish_once"
  ON "credit_entries" ("ref") WHERE "reason" = 'publish';
