-- Migration: credit_entries non-negative invariant + top-up idempotency (S1 / DIG-46, step 2-3)
--
-- Hand-written for the same reason as 0010: the migration journal does not describe the live object set,
-- so a generated migration would recreate every enum and table. Apply this after 0010.
--
-- 1. A balance is SUM(delta). Two concurrent spends can each read a sufficient balance and both insert, so
--    a read-then-insert check in application code is not enough. This trigger takes a per-user
--    transaction-scoped advisory lock before summing, which serialises spends for one user only.
--    A concurrent top-up during a spend can make the spend refuse slightly early (the sum snapshot does not
--    see the uncommitted top-up) — a refusal costs the user nothing, a negative balance hands out credit.
--
-- 2. Paystack redelivers webhooks. Application-level idempotency lives in `webhook_events`, but a unique
--    index on the ledger entry itself means a double-credit is impossible even if that row is missing or
--    was marked failed. 0010 already has the equivalent guard for publish deductions.

CREATE UNIQUE INDEX IF NOT EXISTS "idx_credit_entries_charge_once"
  ON "credit_entries" ("ref") WHERE "reason" = 'paystack_charge';

CREATE OR REPLACE FUNCTION credit_entries_non_negative() RETURNS trigger AS $$
DECLARE
  balance integer;
BEGIN
  IF NEW.delta < 0 THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id));
    SELECT COALESCE(SUM(delta), 0) INTO balance
      FROM credit_entries WHERE user_id = NEW.user_id;
    IF balance + NEW.delta < 0 THEN
      RAISE EXCEPTION 'insufficient_funds' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS credit_entries_non_negative ON "credit_entries";
CREATE TRIGGER credit_entries_non_negative
  BEFORE INSERT ON "credit_entries"
  FOR EACH ROW EXECUTE FUNCTION credit_entries_non_negative();
