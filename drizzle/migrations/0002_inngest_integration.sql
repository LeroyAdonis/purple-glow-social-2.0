-- Inngest Integration Migration
-- Sets up database triggers to send events to Inngest when data changes

-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Create a function to send events to Inngest
CREATE OR REPLACE FUNCTION send_inngest_event(
  event_name TEXT,
  event_data JSONB
) RETURNS VOID AS $$
DECLARE
  inngest_url TEXT;
  signing_key TEXT;
  payload JSONB;
  signature TEXT;
  response http_response;
BEGIN
  -- Get Inngest configuration from environment or settings
  -- Note: In production, these should be set via environment variables
  inngest_url := COALESCE(current_setting('inngest.url', TRUE), 'https://app.inngest.com/api/v1/events');
  signing_key := COALESCE(current_setting('inngest.signing_key', TRUE), '');

  -- Build the payload
  payload := jsonb_build_object(
    'name', event_name,
    'data', event_data,
    'timestamp', extract(epoch from now())::bigint
  );

  -- If signing key is available, create signature
  IF signing_key != '' THEN
    -- Simple HMAC signature (in production, use proper crypto)
    signature := encode(digest(payload::text || signing_key, 'sha256'), 'hex');
    payload := payload || jsonb_build_object('signature', signature);
  END IF;

  -- Send HTTP request to Inngest
  BEGIN
    SELECT * INTO response FROM http((
      'POST',
      inngest_url,
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('Authorization', 'Bearer ' || signing_key)
      ],
      'application/json',
      payload::text
    ));

    -- Log successful sends (optional)
    RAISE NOTICE 'Inngest event sent: % (status: %)', event_name, response.status;

  EXCEPTION WHEN OTHERS THEN
    -- Log failed sends but don't fail the transaction
    RAISE WARNING 'Failed to send Inngest event %: %', event_name, SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for posts table
CREATE OR REPLACE FUNCTION trigger_post_events() RETURNS TRIGGER AS $$
BEGIN
  -- Send event when post status changes to 'scheduled'
  IF TG_OP = 'INSERT' AND NEW.status = 'scheduled' THEN
    PERFORM send_inngest_event(
      'post/scheduled.created',
      jsonb_build_object(
        'postId', NEW.id,
        'userId', NEW.user_id,
        'platform', NEW.platform,
        'scheduledAt', NEW.scheduled_date
      )
    );
  END IF;

  -- Send event when post is updated to 'posted' or 'failed'
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('posted', 'failed') THEN
    PERFORM send_inngest_event(
      'post/status.changed',
      jsonb_build_object(
        'postId', NEW.id,
        'userId', NEW.user_id,
        'platform', NEW.platform,
        'oldStatus', OLD.status,
        'newStatus', NEW.status,
        'publishedAt', NEW.published_at,
        'errorMessage', NEW.error_message
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger function for credit reservations
CREATE OR REPLACE FUNCTION trigger_credit_reservation_events() RETURNS TRIGGER AS $$
BEGIN
  -- Send event when credit reservation is created
  IF TG_OP = 'INSERT' THEN
    PERFORM send_inngest_event(
      'credits/reserved',
      jsonb_build_object(
        'reservationId', NEW.id,
        'userId', NEW.user_id,
        'postId', NEW.post_id,
        'credits', NEW.credits,
        'expiresAt', NEW.expires_at
      )
    );
  END IF;

  -- Send event when reservation status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM send_inngest_event(
      'credits/reservation.updated',
      jsonb_build_object(
        'reservationId', NEW.id,
        'userId', NEW.user_id,
        'oldStatus', OLD.status,
        'newStatus', NEW.status,
        'credits', NEW.credits
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger function for user credits
CREATE OR REPLACE FUNCTION trigger_user_credit_events() RETURNS TRIGGER AS $$
BEGIN
  -- Send event when credits change
  IF TG_OP = 'UPDATE' AND OLD.credits != NEW.credits THEN
    PERFORM send_inngest_event(
      'user/credits.changed',
      jsonb_build_object(
        'userId', NEW.id,
        'oldCredits', OLD.credits,
        'newCredits', NEW.credits,
        'change', NEW.credits - OLD.credits
      )
    );

    -- Send low credit warning if credits drop below threshold
    IF NEW.credits <= 5 AND OLD.credits > 5 THEN
      PERFORM send_inngest_event(
        'credits/low.warning',
        jsonb_build_object(
          'userId', NEW.id,
          'credits', NEW.credits,
          'tier', NEW.tier
        )
      );
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers on relevant tables
CREATE TRIGGER posts_inngest_trigger
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION trigger_post_events();

CREATE TRIGGER credit_reservations_inngest_trigger
  AFTER INSERT OR UPDATE ON credit_reservations
  FOR EACH ROW EXECUTE FUNCTION trigger_credit_reservation_events();

CREATE TRIGGER user_credits_inngest_trigger
  AFTER UPDATE ON "user"
  FOR EACH ROW EXECUTE FUNCTION trigger_user_credit_events();

-- Set up configuration (these should be set via environment variables in production)
-- ALTER DATABASE postgres SET inngest.url = 'https://app.inngest.com/api/v1/events';
-- ALTER DATABASE postgres SET inngest.signing_key = 'your-signing-key-here';</content>
<parameter name="filePath">c:\scratchpad\purple-glow-social-2.0\drizzle\migrations\0002_inngest_integration.sql