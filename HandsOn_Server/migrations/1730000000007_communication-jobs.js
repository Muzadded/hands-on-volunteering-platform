/**
 * Communication: prefs, phone, job queue, templates, message logs.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_in_app BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_email BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN NOT NULL DEFAULT false;

    CREATE TABLE IF NOT EXISTS background_jobs (
      id SERIAL PRIMARY KEY,
      job_type VARCHAR(64) NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      last_error TEXT,
      dedupe_key VARCHAR(191),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      CONSTRAINT background_jobs_status_check
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
    );

    CREATE INDEX IF NOT EXISTS background_jobs_claim_idx
      ON background_jobs (status, run_at);
    CREATE UNIQUE INDEX IF NOT EXISTS background_jobs_dedupe_pending_idx
      ON background_jobs (dedupe_key)
      WHERE dedupe_key IS NOT NULL AND status IN ('pending', 'processing');

    CREATE TABLE IF NOT EXISTS message_templates (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      name VARCHAR(100) NOT NULL,
      channel VARCHAR(20) NOT NULL DEFAULT 'all',
      subject VARCHAR(255),
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT message_templates_channel_check
        CHECK (channel IN ('in_app', 'email', 'sms', 'all'))
    );

    CREATE TABLE IF NOT EXISTS message_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      channel VARCHAR(20) NOT NULL,
      template_id INTEGER REFERENCES message_templates(id) ON DELETE SET NULL,
      subject TEXT,
      body TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'sent',
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS message_logs_user_created_idx
      ON message_logs (user_id, created_at DESC);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS message_logs;
    DROP TABLE IF EXISTS message_templates;
    DROP TABLE IF EXISTS background_jobs;
    ALTER TABLE users DROP COLUMN IF EXISTS notify_sms;
    ALTER TABLE users DROP COLUMN IF EXISTS notify_email;
    ALTER TABLE users DROP COLUMN IF EXISTS notify_in_app;
    ALTER TABLE users DROP COLUMN IF EXISTS phone;
  `);
}
