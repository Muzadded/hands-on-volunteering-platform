import pool from "../../db.js";

export async function create({ userId, type, payload = {} }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, payload)
     VALUES ($1, $2, $3::jsonb)
     RETURNING *`,
    [userId, type, JSON.stringify(payload)]
  );
  return result.rows[0];
}

export async function listForUser(userId, { limit = 20 } = {}) {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function countUnread(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  return result.rows[0].count;
}

export async function markRead(userId, ids = []) {
  if (!ids.length) {
    const result = await pool.query(
      `UPDATE notifications
       SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL
       RETURNING id`,
      [userId]
    );
    return result.rows;
  }

  const result = await pool.query(
    `UPDATE notifications
     SET read_at = NOW()
     WHERE user_id = $1 AND id = ANY($2::int[]) AND read_at IS NULL
     RETURNING id`,
    [userId, ids]
  );
  return result.rows;
}
