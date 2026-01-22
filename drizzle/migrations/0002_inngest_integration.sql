-- Inngest Integration Migration
-- Sets up database triggers to send events to Inngest when data changes

-- NOTE: This migration requires the http extension which may not be available on all Neon databases
-- If the extension is not available, this migration will be skipped
-- To enable: Contact Neon support or use a different hosting provider with http extension support

-- Enable the http extension for making HTTP requests (may fail on some platforms)
-- CREATE EXTENSION IF NOT EXISTS http;

-- Create a stub function to send events to Inngest (simplified version without http extension)
CREATE OR REPLACE FUNCTION send_inngest_event(
  event_name TEXT,
  event_data JSONB
) RETURNS VOID AS $$
BEGIN
  -- Log the event (can be picked up by external log processors or replaced with actual HTTP calls)
  RAISE NOTICE 'Inngest event: % with data: %', event_name, event_data::text;
  
  -- TODO: Replace with actual HTTP call when http extension is available
  -- or use application-level webhook calls instead of database triggers
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
DROP TRIGGER IF EXISTS posts_inngest_trigger ON posts;
CREATE TRIGGER posts_inngest_trigger
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION trigger_post_events();

DROP TRIGGER IF EXISTS credit_reservations_inngest_trigger ON credit_reservations;
CREATE TRIGGER credit_reservations_inngest_trigger
  AFTER INSERT OR UPDATE ON credit_reservations
  FOR EACH ROW EXECUTE FUNCTION trigger_credit_reservation_events();

DROP TRIGGER IF EXISTS user_credits_inngest_trigger ON "user";
CREATE TRIGGER user_credits_inngest_trigger
  AFTER UPDATE ON "user"
  FOR EACH ROW EXECUTE FUNCTION trigger_user_credit_events();

-- Set up configuration (these should be set via environment variables in production)
-- ALTER DATABASE postgres SET inngest.url = 'https://app.inngest.com/api/v1/events';
-- ALTER DATABASE postgres SET inngest.signing_key = 'your-signing-key-here';