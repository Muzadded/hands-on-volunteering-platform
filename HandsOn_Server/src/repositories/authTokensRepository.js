import pool from "../../db.js";

export async function createToken({ userId, purpose, tokenHash, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO auth_tokens (user_id, purpose, token_hash, expires_at)
     VALUES ($1,$2,$3,$4)
     RETURNING id, user_id, purpose, expires_at, created_at`,
    [userId, purpose, tokenHash, expiresAt]
  );
  return result.rows[0];
}

export async function findValidToken(purpose, tokenHash) {
  const result = await pool.query(
    `SELECT *
     FROM auth_tokens
     WHERE purpose = $1
       AND token_hash = $2
       AND used_at IS NULL
       AND expires_at > NOW()`,
    [purpose, tokenHash]
  );
  return result.rows[0] || null;
}

export async function markUsed(id) {
  await pool.query(
    `UPDATE auth_tokens SET used_at = NOW() WHERE id = $1`,
    [id]
  );
}

export async function invalidateUserTokens(userId, purpose) {
  await pool.query(
    `UPDATE auth_tokens
     SET used_at = COALESCE(used_at, NOW())
     WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`,
    [userId, purpose]
  );
}
