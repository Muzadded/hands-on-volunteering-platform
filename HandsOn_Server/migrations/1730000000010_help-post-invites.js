/**
 * Help Posts Phase 4: one-tap invites + shared contact after accept.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS help_post_invites (
      id SERIAL PRIMARY KEY,
      help_post_id INTEGER NOT NULL REFERENCES help_post(help_post_id) ON DELETE CASCADE,
      invited_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      invited_by INTEGER NOT NULL REFERENCES users(user_id),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      shared_contact JSONB,
      meeting_time TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      responded_at TIMESTAMPTZ,
      CONSTRAINT help_post_invites_status_check
        CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
      CONSTRAINT help_post_invites_unique UNIQUE (help_post_id, invited_user_id)
    );

    CREATE INDEX IF NOT EXISTS help_post_invites_user_idx
      ON help_post_invites (invited_user_id, status);
    CREATE INDEX IF NOT EXISTS help_post_invites_post_idx
      ON help_post_invites (help_post_id);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS help_post_invites;
  `);
}
