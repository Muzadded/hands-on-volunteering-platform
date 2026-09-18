import pool from "../../db.js";

export async function createHelpPost({
  created_by,
  details,
  location,
  urgency_level,
}) {
  const result = await pool.query(
    `INSERT INTO help_post (created_by, details, location, urgency_level, status)
     VALUES ($1,$2,$3,$4,'open') RETURNING *`,
    [created_by, details, location, urgency_level]
  );
  return result.rows[0];
}

export async function listHelpPosts({ status, urgency } = {}) {
  const clauses = [];
  const params = [];

  if (status) {
    params.push(status);
    clauses.push(`hp.status = $${params.length}`);
  }
  if (urgency) {
    params.push(urgency);
    clauses.push(`hp.urgency_level = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT hp.*, u.name as requester_name,
           helper.name as helper_name,
           (SELECT COUNT(*) FROM help_post_comments
            WHERE help_post_comments.help_post_id = hp.help_post_id) as comment_count
    FROM help_post hp
    JOIN users u ON hp.created_by = u.user_id
    LEFT JOIN users helper ON hp.claimed_by = helper.user_id
    ${where}
    ORDER BY
      CASE
        WHEN hp.urgency_level = 'urgent' THEN 1
        WHEN hp.urgency_level = 'medium' THEN 2
        WHEN hp.urgency_level = 'low' THEN 3
        ELSE 4
      END,
      hp.created_at DESC
  `,
    params
  );
  return result.rows;
}

export async function findHelpPostById(postId) {
  const result = await pool.query(
    `SELECT hp.*, u.name as requester_name, helper.name as helper_name
     FROM help_post hp
     JOIN users u ON hp.created_by = u.user_id
     LEFT JOIN users helper ON hp.claimed_by = helper.user_id
     WHERE hp.help_post_id = $1`,
    [postId]
  );
  return result.rows[0] || null;
}

export async function listComments(postId) {
  const result = await pool.query(
    `SELECT hpc.*, u.name as commenter_name
     FROM help_post_comments hpc
     JOIN users u ON hpc.user_id = u.user_id
     WHERE hpc.help_post_id = $1
     ORDER BY hpc.created_at ASC`,
    [postId]
  );
  return result.rows;
}

export async function addComment(postId, userId, comment) {
  const result = await pool.query(
    `INSERT INTO help_post_comments (help_post_id, user_id, comment)
     VALUES ($1,$2,$3) RETURNING *`,
    [postId, userId, comment]
  );
  const userResult = await pool.query(
    "SELECT name FROM users WHERE user_id = $1",
    [userId]
  );
  return {
    ...result.rows[0],
    commenter_name: userResult.rows[0]?.name || "Unknown User",
  };
}

export async function claimHelpPost(postId, userId) {
  const result = await pool.query(
    `UPDATE help_post
     SET claimed_by = $2, status = 'in_progress'
     WHERE help_post_id = $1 AND status = 'open' AND claimed_by IS NULL
     RETURNING *`,
    [postId, userId]
  );
  return result.rows[0] || null;
}

export async function updateHelpPost(postId, { status, clearClaim = false }) {
  const result = await pool.query(
    `UPDATE help_post
     SET status = COALESCE($2, status),
         claimed_by = CASE WHEN $3 THEN NULL ELSE claimed_by END
     WHERE help_post_id = $1
     RETURNING *`,
    [postId, status ?? null, clearClaim]
  );
  return result.rows[0] || null;
}

export async function countContributions(userId) {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM help_post WHERE created_by = $1) AS created,
       (SELECT COUNT(*)::int FROM help_post WHERE claimed_by = $1) AS claimed,
       (SELECT COUNT(*)::int FROM help_post_comments WHERE user_id = $1) AS comments`,
    [userId]
  );
  return result.rows[0];
}
