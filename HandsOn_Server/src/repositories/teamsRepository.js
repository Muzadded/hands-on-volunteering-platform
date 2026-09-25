import pool from "../../db.js";
import { randomBytes } from "crypto";

export async function createTeam({ name, description, category, isPrivate, created_by }) {
  const result = await pool.query(
    `INSERT INTO teams (name, description, category, is_private, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, description, category, isPrivate, created_by]
  );
  return result.rows[0];
}

export async function updateTeam(teamId, { name, description, category, isPrivate }) {
  const result = await pool.query(
    `UPDATE teams
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         category = COALESCE($4, category),
         is_private = COALESCE($5, is_private)
     WHERE id = $1
     RETURNING *`,
    [teamId, name ?? null, description ?? null, category ?? null, isPrivate ?? null]
  );
  return result.rows[0] || null;
}

export async function addMember(teamId, userId, role = "member") {
  const result = await pool.query(
    `INSERT INTO team_members (team_id, user_id, role)
     VALUES ($1,$2,$3) RETURNING *`,
    [teamId, userId, role]
  );
  return result.rows[0];
}

export async function removeMember(teamId, userId) {
  const result = await pool.query(
    `DELETE FROM team_members
     WHERE team_id = $1 AND user_id = $2
     RETURNING *`,
    [teamId, userId]
  );
  return result.rows[0] || null;
}

export async function getMemberRole(teamId, userId) {
  const result = await pool.query(
    `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2`,
    [teamId, userId]
  );
  return result.rows[0]?.role || null;
}

export async function listTeams(userId = null) {
  const query = `
    SELECT t.*,
           COUNT(DISTINCT tm.user_id) as member_count,
           ${
             userId
               ? "EXISTS(SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = $1) as is_member"
               : "FALSE as is_member"
           }
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.is_private = false
       ${
         userId
           ? "OR EXISTS(SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = $1)"
           : ""
       }
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;
  const result = await pool.query(query, userId ? [userId] : []);
  return result.rows;
}

export async function findTeamById(teamId) {
  const result = await pool.query("SELECT * FROM teams WHERE id = $1", [teamId]);
  return result.rows[0] || null;
}

export async function isMember(teamId, userId) {
  const result = await pool.query(
    "SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2",
    [teamId, userId]
  );
  return result.rows.length > 0;
}

export async function findTeamWithMembership(teamId, userId = null) {
  const teamQuery = `
    SELECT t.*,
           COUNT(DISTINCT tm.user_id) as member_count,
           ${
             userId
               ? "EXISTS(SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = $1) as is_member"
               : "FALSE as is_member"
           }
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id = ${userId ? "$2" : "$1"}
    GROUP BY t.id
  `;
  const teamResult = await pool.query(
    teamQuery,
    userId ? [userId, teamId] : [teamId]
  );
  return teamResult.rows[0] || null;
}

export async function listMembers(teamId) {
  const result = await pool.query(
    `SELECT u.user_id, u.name, u.email, tm.role, tm.joined_at
     FROM team_members tm
     JOIN users u ON tm.user_id = u.user_id
     WHERE tm.team_id = $1
     ORDER BY
       CASE
         WHEN tm.role = 'owner' THEN 1
         WHEN tm.role = 'admin' THEN 2
         ELSE 3
       END,
       tm.joined_at ASC`,
    [teamId]
  );
  return result.rows;
}

export async function createInvite(teamId, createdBy, expiresAt = null) {
  const code = randomBytes(6).toString("hex");
  const result = await pool.query(
    `INSERT INTO team_invites (team_id, code, created_by, expires_at)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [teamId, code, createdBy, expiresAt]
  );
  return result.rows[0];
}

export async function findInviteByCode(code) {
  const result = await pool.query(
    `SELECT ti.*, t.name as team_name, t.is_private
     FROM team_invites ti
     JOIN teams t ON t.id = ti.team_id
     WHERE ti.code = $1`,
    [code]
  );
  return result.rows[0] || null;
}
