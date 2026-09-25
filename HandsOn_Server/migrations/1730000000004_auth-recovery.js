/**
 * Phase 0: email verification + password reset tokens.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      purpose VARCHAR(32) NOT NULL,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT auth_tokens_purpose_check
        CHECK (purpose IN ('email_verify', 'password_reset'))
    );

    CREATE INDEX IF NOT EXISTS auth_tokens_user_purpose_idx
      ON auth_tokens (user_id, purpose);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS auth_tokens;
    ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
  `);
}
