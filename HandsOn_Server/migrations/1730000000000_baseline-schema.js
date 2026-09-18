/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Baseline schema — safe for empty DBs (IF NOT EXISTS).
 * Existing HandsOn databases already have these tables.
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name character varying(255) NOT NULL,
      email character varying(255) UNIQUE NOT NULL,
      password character varying(255) NOT NULL,
      gender character varying(50) NOT NULL,
      dob DATE,
      about TEXT,
      skills TEXT,
      causes TEXT[]
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title character varying(255) NOT NULL,
      details TEXT,
      date DATE,
      location character varying(255),
      start_time TIME WITHOUT TIME ZONE,
      end_time TIME WITHOUT TIME ZONE,
      category character varying(255),
      member_limit INTEGER NOT NULL,
      total_member INTEGER DEFAULT 1,
      created_by INTEGER REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS join_event (
      join_id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id),
      user_id INTEGER REFERENCES users(user_id),
      join_date DATE
    );

    CREATE TABLE IF NOT EXISTS help_post (
      help_post_id SERIAL PRIMARY KEY,
      created_by INTEGER REFERENCES users(user_id),
      details TEXT NOT NULL,
      location character varying(255),
      urgency_level character varying(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS help_post_comments (
      comment_id SERIAL PRIMARY KEY,
      help_post_id INTEGER REFERENCES help_post(help_post_id),
      user_id INTEGER REFERENCES users(user_id),
      comment TEXT NOT NULL,
      created_at TIME WITHOUT TIME ZONE
    );

    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name character varying(255) NOT NULL,
      description TEXT,
      category character varying(255),
      is_private BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(user_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      team_id INTEGER REFERENCES teams(id),
      user_id INTEGER REFERENCES users(user_id),
      role character varying(50) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  // Do not drop baseline tables automatically — data loss risk on shared DBs.
  pgm.sql(`SELECT 1`);
}
