# Findings

> **Generated file.** The findings ledger: review findings raised by `/audit`
> against the work in progress, each with a durable ID, severity (P0-P3), and
> status. `/implement` marks repaired findings `fixed`, a later `/audit` pass
> moves them to `closed`, and `/complete` refuses to land while any P0 or P1
> finding is `open` or `fixed`, then archives resolved findings with the work
> and resets this file.

_No findings recorded. `/audit` appends findings here when it finds them._

## F-01 — Migration journal does not describe the live database (P1)

**Found:** 2026-10-25, while adding the `credit_entries` table (DIG-46).

`npx drizzle-kit generate` produced a migration that recreated **every enum and table** in the schema, because
the database was built with `drizzle-kit push` and `drizzle/migrations/meta/_journal.json` only describes
migrations 0000–0002 while hand-written files (e.g. `0009_add_pkce_verifiers.sql`) were added outside the
journal. Applying the generated file would fail on existing objects, or worse, be destructive if it ran.

**Resolution for now:** the credit_entries migration is hand-written (`0010_credit_entries.sql`) and was proven
by applying it inside a transaction and rolling back. Generated migrations must not be trusted again until the
journal is reconciled with the real schema.

**Before the next generated migration:** dump the live schema, diff it against `drizzle/schema.ts`, and either
regenerate the journal baseline or explicitly adopt hand-written migrations only. Decide once, write it in
`coding-standards.md`, and stop mixing the two.
