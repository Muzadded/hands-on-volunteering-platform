/**
 * Priority 1.2: event lifecycle — status, waitlist, withdraw, recurrence.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'open';
    DO $$ BEGIN
      ALTER TABLE events
        ADD CONSTRAINT events_status_check
        CHECK (status IN ('open', 'cancelled'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE events ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS share_slug VARCHAR(64) UNIQUE;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(50);
    ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_parent_id INTEGER
      REFERENCES events(id) ON DELETE SET NULL;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS checkin_token VARCHAR(64) UNIQUE;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS waiver_text TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS min_age INTEGER;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS required_credentials TEXT[] DEFAULT '{}';

    -- Expand join_event status for waitlist
    ALTER TABLE join_event DROP CONSTRAINT IF EXISTS join_event_status_check;
    ALTER TABLE join_event
      ADD CONSTRAINT join_event_status_check
      CHECK (status IN ('registered', 'waitlisted', 'attended', 'no_show', 'withdrawn'));

    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS waitlisted_at TIMESTAMPTZ;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS guest_count INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS shift_id INTEGER;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMPTZ;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS check_out_at TIMESTAMPTZ;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ;
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS waiver_signature TEXT;

    CREATE TABLE IF NOT EXISTS event_shifts (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      role_name VARCHAR(100) NOT NULL,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS event_shifts_event_idx ON event_shifts (event_id);

    -- Optional FK for shift_id after table exists
    DO $$ BEGIN
      ALTER TABLE join_event
        ADD CONSTRAINT join_event_shift_fk
        FOREIGN KEY (shift_id) REFERENCES event_shifts(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS user_credentials (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      credential_type VARCHAR(100) NOT NULL,
      label VARCHAR(255),
      document_url TEXT,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS user_credentials_user_idx ON user_credentials (user_id);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS user_credentials;
    ALTER TABLE join_event DROP CONSTRAINT IF EXISTS join_event_shift_fk;
    DROP TABLE IF EXISTS event_shifts;

    ALTER TABLE join_event DROP COLUMN IF EXISTS waiver_signature;
    ALTER TABLE join_event DROP COLUMN IF EXISTS waiver_signed_at;
    ALTER TABLE join_event DROP COLUMN IF EXISTS check_out_at;
    ALTER TABLE join_event DROP COLUMN IF EXISTS check_in_at;
    ALTER TABLE join_event DROP COLUMN IF EXISTS shift_id;
    ALTER TABLE join_event DROP COLUMN IF EXISTS guest_count;
    ALTER TABLE join_event DROP COLUMN IF EXISTS withdrawn_at;
    ALTER TABLE join_event DROP COLUMN IF EXISTS waitlisted_at;

    ALTER TABLE join_event DROP CONSTRAINT IF EXISTS join_event_status_check;
    ALTER TABLE join_event
      ADD CONSTRAINT join_event_status_check
      CHECK (status IN ('registered', 'attended', 'no_show'));

    ALTER TABLE events DROP COLUMN IF EXISTS required_credentials;
    ALTER TABLE events DROP COLUMN IF EXISTS min_age;
    ALTER TABLE events DROP COLUMN IF EXISTS waiver_text;
    ALTER TABLE events DROP COLUMN IF EXISTS checkin_token;
    ALTER TABLE events DROP COLUMN IF EXISTS recurrence_parent_id;
    ALTER TABLE events DROP COLUMN IF EXISTS recurrence_rule;
    ALTER TABLE events DROP COLUMN IF EXISTS share_slug;
    ALTER TABLE events DROP COLUMN IF EXISTS cancel_reason;
    ALTER TABLE events DROP COLUMN IF EXISTS cancelled_at;
    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
    ALTER TABLE events DROP COLUMN IF EXISTS status;
  `);
}
