/**
 * Help Posts Phases 5–6: reviews + moderation reports.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS help_post_reviews (
      id SERIAL PRIMARY KEY,
      help_post_id INTEGER NOT NULL REFERENCES help_post(help_post_id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      reviewee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT help_post_reviews_unique UNIQUE (help_post_id, reviewer_id)
    );

    CREATE INDEX IF NOT EXISTS help_post_reviews_reviewee_idx
      ON help_post_reviews (reviewee_id);

    CREATE TABLE IF NOT EXISTS moderation_reports (
      id SERIAL PRIMARY KEY,
      reporter_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      target_type VARCHAR(20) NOT NULL,
      target_id INTEGER NOT NULL,
      reason VARCHAR(100) NOT NULL,
      details TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'open',
      resolved_by INTEGER REFERENCES users(user_id),
      resolved_at TIMESTAMPTZ,
      resolution_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT moderation_reports_target_check
        CHECK (target_type IN ('help_post', 'user')),
      CONSTRAINT moderation_reports_status_check
        CHECK (status IN ('open', 'resolved', 'dismissed'))
    );

    CREATE INDEX IF NOT EXISTS moderation_reports_status_idx
      ON moderation_reports (status, created_at DESC);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS moderation_reports;
    DROP TABLE IF EXISTS help_post_reviews;
  `);
}
