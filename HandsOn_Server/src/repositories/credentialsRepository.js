import pool from "../../db.js";

export async function listForUser(userId) {
  const result = await pool.query(
    `SELECT * FROM user_credentials WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function create(row) {
  const result = await pool.query(
    `INSERT INTO user_credentials (user_id, credential_type, label, document_url)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [row.user_id, row.credential_type, row.label || null, row.document_url || null]
  );
  return result.rows[0];
}

export async function remove(id, userId) {
  const result = await pool.query(
    `DELETE FROM user_credentials WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function hasTypes(userId, types = []) {
  if (!types.length) return true;
  const result = await pool.query(
    `SELECT DISTINCT credential_type FROM user_credentials WHERE user_id = $1`,
    [userId]
  );
  const have = new Set(result.rows.map((r) => String(r.credential_type).toLowerCase()));
  return types.every((t) => have.has(String(t).toLowerCase()));
}
