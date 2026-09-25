/**
 * Phase 0: real event time handling with TIMESTAMPTZ.
 * Keeps legacy date/start_time/end_time columns populated for UI compatibility.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE events ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

    UPDATE events
    SET
      starts_at = CASE
        WHEN date IS NULL OR start_time IS NULL THEN NULL
        ELSE (date::text || ' ' || start_time::text)::timestamp AT TIME ZONE 'UTC'
      END,
      ends_at = CASE
        WHEN date IS NULL OR end_time IS NULL THEN NULL
        WHEN end_time <= start_time THEN
          ((date + 1)::text || ' ' || end_time::text)::timestamp AT TIME ZONE 'UTC'
        ELSE
          (date::text || ' ' || end_time::text)::timestamp AT TIME ZONE 'UTC'
      END
    WHERE starts_at IS NULL OR ends_at IS NULL;

    CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events (starts_at);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP INDEX IF EXISTS events_starts_at_idx;
    ALTER TABLE events DROP COLUMN IF EXISTS ends_at;
    ALTER TABLE events DROP COLUMN IF EXISTS starts_at;
  `);
}
