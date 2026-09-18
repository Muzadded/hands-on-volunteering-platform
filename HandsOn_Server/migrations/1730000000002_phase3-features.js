/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Phase 3 differentiators: skills arrays, tags, attendance, help workflow,
 * team roles/invites, notifications.
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    -- users.skills: TEXT -> TEXT[]
    ALTER TABLE users ADD COLUMN IF NOT EXISTS skills_arr TEXT[];
    UPDATE users
    SET skills_arr = CASE
      WHEN skills IS NULL OR btrim(skills) = '' THEN '{}'::text[]
      ELSE ARRAY(
        SELECT DISTINCT btrim(x)
        FROM unnest(string_to_array(skills, ',')) AS x
        WHERE btrim(x) <> ''
      )
    END
    WHERE skills_arr IS NULL;
    ALTER TABLE users DROP COLUMN IF EXISTS skills;
    ALTER TABLE users RENAME COLUMN skills_arr TO skills;
    ALTER TABLE users ALTER COLUMN skills SET DEFAULT '{}';

    -- event tags for matching
    ALTER TABLE events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    UPDATE events
    SET tags = ARRAY[lower(category)]
    WHERE (tags IS NULL OR cardinality(tags) = 0) AND category IS NOT NULL;

    -- attendance status on join_event
    ALTER TABLE join_event ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'registered';
    UPDATE join_event SET status = 'registered' WHERE status IS NULL;
    DO $$ BEGIN
      ALTER TABLE join_event
        ADD CONSTRAINT join_event_status_check
        CHECK (status IN ('registered', 'attended', 'no_show'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- help workflow
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS claimed_by INTEGER REFERENCES users(user_id);
    UPDATE help_post SET status = 'open' WHERE status IS NULL;
    DO $$ BEGIN
      ALTER TABLE help_post
        ADD CONSTRAINT help_post_status_check
        CHECK (status IN ('open', 'in_progress', 'resolved'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- team roles: creator -> owner; moderator -> admin
    UPDATE team_members tm
    SET role = 'owner'
    FROM teams t
    WHERE tm.team_id = t.id AND tm.user_id = t.created_by;

    UPDATE team_members SET role = 'admin' WHERE role = 'moderator';
    UPDATE team_members SET role = 'member'
    WHERE role IS NULL OR role NOT IN ('owner', 'admin', 'member');

    DO $$ BEGIN
      ALTER TABLE team_members
        ADD CONSTRAINT team_members_role_check
        CHECK (role IN ('owner', 'admin', 'member'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS team_invites (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      code VARCHAR(32) NOT NULL UNIQUE,
      created_by INTEGER REFERENCES users(user_id),
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS notifications_user_created_idx
      ON notifications (user_id, created_at DESC);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS team_invites;

    ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_role_check;
    ALTER TABLE help_post DROP CONSTRAINT IF EXISTS help_post_status_check;
    ALTER TABLE help_post DROP COLUMN IF EXISTS claimed_by;
    ALTER TABLE help_post DROP COLUMN IF EXISTS status;
    ALTER TABLE join_event DROP CONSTRAINT IF EXISTS join_event_status_check;
    ALTER TABLE join_event DROP COLUMN IF EXISTS status;
    ALTER TABLE events DROP COLUMN IF EXISTS tags;

    ALTER TABLE users ADD COLUMN IF NOT EXISTS skills_text TEXT;
    UPDATE users SET skills_text = array_to_string(skills, ', ');
    ALTER TABLE users DROP COLUMN IF EXISTS skills;
    ALTER TABLE users RENAME COLUMN skills_text TO skills;
  `);
}
