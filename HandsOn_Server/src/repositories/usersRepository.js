import pool from "../../db.js";

const SAFE_USER_COLUMNS =
  "user_id, name, gender, dob, email, about, skills, causes, email_verified_at";

export async function findById(id) {
  const result = await pool.query(
    `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE user_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findAuthByEmail(email) {
  const result = await pool.query(
    "SELECT user_id, password, email, email_verified_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

export async function emailExists(email) {
  const result = await pool.query("SELECT user_id FROM users WHERE email = $1", [
    email,
  ]);
  return result.rowCount > 0;
}

export async function createUser({
  name,
  gender,
  dob,
  email,
  passwordHash,
  about,
  skills,
  causes,
}) {
  const result = await pool.query(
    `INSERT INTO users (name, gender, dob, email, password, about, skills, causes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING user_id`,
    [name, gender, dob, email, passwordHash, about, skills, causes]
  );
  return result.rows[0];
}

export async function updateProfile(id, { name, gender, dob, about, skills, causes }) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, gender = $2, dob = $3, about = $4, skills = $5, causes = $6
     WHERE user_id = $7
     RETURNING ${SAFE_USER_COLUMNS}`,
    [name, gender, dob, about, skills, causes, id]
  );
  return result.rows[0] || null;
}

export async function updatePassword(userId, passwordHash) {
  const result = await pool.query(
    `UPDATE users SET password = $2 WHERE user_id = $1 RETURNING user_id`,
    [userId, passwordHash]
  );
  return result.rows[0] || null;
}

export async function markEmailVerified(userId) {
  const result = await pool.query(
    `UPDATE users
     SET email_verified_at = COALESCE(email_verified_at, NOW())
     WHERE user_id = $1
     RETURNING ${SAFE_USER_COLUMNS}`,
    [userId]
  );
  return result.rows[0] || null;
}

export async function findJoinedEvents(userId) {
  const result = await pool.query(
    `SELECT e.*, je.join_date, je.status as attendance_status,
            (SELECT COUNT(*) FROM join_event WHERE event_id = e.id) as registered_volunteers
     FROM events e
     INNER JOIN join_event je ON e.id = je.event_id
     WHERE je.user_id = $1
     ORDER BY e.date DESC`,
    [userId]
  );
  return result.rows;
}

export async function findJoinedTeams(userId) {
  const result = await pool.query(
    `SELECT
       t.*,
       tm.role,
       tm.joined_at,
       COUNT(DISTINCT tm2.user_id) as member_count,
       (SELECT name FROM users WHERE user_id = t.created_by) as created_by_name
     FROM teams t
     INNER JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = $1
     LEFT JOIN team_members tm2 ON t.id = tm2.team_id
     GROUP BY t.id, tm.role, tm.joined_at
     ORDER BY tm.joined_at DESC`,
    [userId]
  );
  return result.rows;
}
