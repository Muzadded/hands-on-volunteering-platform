/**
 * Priority 1.1: organizations, staff roles, platform admin, event org link.
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS platform_role VARCHAR(20) NOT NULL DEFAULT 'user';
    DO $$ BEGIN
      ALTER TABLE users
        ADD CONSTRAINT users_platform_role_check
        CHECK (platform_role IN ('user', 'admin'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      logo_url TEXT,
      description TEXT,
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      website VARCHAR(255),
      created_by INTEGER REFERENCES users(user_id),
      verified_at TIMESTAMPTZ,
      verified_by INTEGER REFERENCES users(user_id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organization_members (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL DEFAULT 'coordinator',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT organization_members_role_check
        CHECK (role IN ('owner', 'coordinator')),
      CONSTRAINT organization_members_unique UNIQUE (organization_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS organization_members_user_idx
      ON organization_members (user_id);

    ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id INTEGER
      REFERENCES organizations(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS events_organization_id_idx
      ON events (organization_id);
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql(`
    ALTER TABLE events DROP COLUMN IF EXISTS organization_id;
    DROP TABLE IF EXISTS organization_members;
    DROP TABLE IF EXISTS organizations;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_platform_role_check;
    ALTER TABLE users DROP COLUMN IF EXISTS platform_role;
  `);
}
