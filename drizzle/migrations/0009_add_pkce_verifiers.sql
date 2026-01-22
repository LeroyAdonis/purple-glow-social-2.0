-- Migration: Add PKCE Verifiers Table
-- Security improvement: Store PKCE verifiers in database instead of cookies
-- Reference: RFC 7636 - Proof Key for Code Exchange

CREATE TABLE IF NOT EXISTS "pkce_verifiers" (
  "state" text PRIMARY KEY NOT NULL,
  "code_verifier" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL
);

-- Create index for efficient expiry cleanup
CREATE INDEX IF NOT EXISTS "pkce_verifiers_expires_at_idx" ON "pkce_verifiers" ("expires_at");

-- Add comment for documentation
COMMENT ON TABLE "pkce_verifiers" IS 'Stores PKCE code verifiers for OAuth 2.0 flows. Auto-expires after 10 minutes.';
COMMENT ON COLUMN "pkce_verifiers"."state" IS 'OAuth state parameter (primary key)';
COMMENT ON COLUMN "pkce_verifiers"."code_verifier" IS 'PKCE code verifier (RFC 7636)';
COMMENT ON COLUMN "pkce_verifiers"."expires_at" IS 'Expiration timestamp (10 minutes from creation)';
