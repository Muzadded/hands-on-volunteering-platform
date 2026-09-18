/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Harden join tables against duplicate memberships / race inserts.
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql(`
    DELETE FROM join_event a
    USING join_event b
    WHERE a.join_id > b.join_id
      AND a.event_id = b.event_id
      AND a.user_id = b.user_id;

    DELETE FROM team_members a
    USING team_members b
    WHERE a.id > b.id
      AND a.team_id = b.team_id
      AND a.user_id = b.user_id;
  `);

  pgm.addConstraint("join_event", "join_event_event_user_unique", {
    unique: ["event_id", "user_id"],
  });

  pgm.addConstraint("team_members", "team_members_team_user_unique", {
    unique: ["team_id", "user_id"],
  });
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.dropConstraint("team_members", "team_members_team_user_unique");
  pgm.dropConstraint("join_event", "join_event_event_user_unique");
}
