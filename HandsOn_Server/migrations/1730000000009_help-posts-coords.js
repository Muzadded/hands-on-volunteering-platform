/**
 * Help Posts Phase 3: coordinates for map / nearby.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

    CREATE INDEX IF NOT EXISTS help_post_coords_idx
      ON help_post (lat, lng)
      WHERE lat IS NOT NULL AND lng IS NOT NULL;

    CREATE INDEX IF NOT EXISTS users_coords_idx
      ON users (lat, lng)
      WHERE lat IS NOT NULL AND lng IS NOT NULL;
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP INDEX IF EXISTS users_coords_idx;
    DROP INDEX IF EXISTS help_post_coords_idx;
    ALTER TABLE users DROP COLUMN IF EXISTS lat;
    ALTER TABLE users DROP COLUMN IF EXISTS lng;
    ALTER TABLE help_post DROP COLUMN IF EXISTS lat;
    ALTER TABLE help_post DROP COLUMN IF EXISTS lng;
  `);
}
