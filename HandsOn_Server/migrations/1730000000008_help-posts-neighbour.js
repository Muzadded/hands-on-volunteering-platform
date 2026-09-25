/**
 * Help Posts upgrade (neighbour help) — Phase 1:
 * title, post_type (ask|offer), category.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS title VARCHAR(200);
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS post_type VARCHAR(10) NOT NULL DEFAULT 'ask';
    ALTER TABLE help_post ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'other';

    UPDATE help_post
    SET title = LEFT(COALESCE(NULLIF(btrim(details), ''), 'Help request'), 120)
    WHERE title IS NULL OR btrim(title) = '';

    ALTER TABLE help_post ALTER COLUMN title SET NOT NULL;

    DO $$ BEGIN
      ALTER TABLE help_post
        ADD CONSTRAINT help_post_type_check
        CHECK (post_type IN ('ask', 'offer'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE help_post
        ADD CONSTRAINT help_post_category_check
        CHECK (category IN (
          'groceries',
          'medicine',
          'elderly_checkin',
          'ride',
          'tutoring',
          'evacuation',
          'other'
        ));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS help_post_type_status_idx
      ON help_post (post_type, status);
    CREATE INDEX IF NOT EXISTS help_post_category_idx
      ON help_post (category);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    DROP INDEX IF EXISTS help_post_category_idx;
    DROP INDEX IF EXISTS help_post_type_status_idx;
    ALTER TABLE help_post DROP CONSTRAINT IF EXISTS help_post_category_check;
    ALTER TABLE help_post DROP CONSTRAINT IF EXISTS help_post_type_check;
    ALTER TABLE help_post DROP COLUMN IF EXISTS category;
    ALTER TABLE help_post DROP COLUMN IF EXISTS post_type;
    ALTER TABLE help_post DROP COLUMN IF EXISTS title;
  `);
}
