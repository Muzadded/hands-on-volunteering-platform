import pool from "../../db.js";

export async function createHelpPost({
  created_by,
  title,
  details,
  location,
  urgency_level,
  post_type = "ask",
  category = "other",
  lat = null,
  lng = null,
}) {
  const result = await pool.query(
    `INSERT INTO help_post
       (created_by, title, details, location, urgency_level, post_type, category, status, lat, lng)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8,$9) RETURNING *`,
    [created_by, title, details, location, urgency_level, post_type, category, lat, lng]
  );
  return result.rows[0];
}

export async function listHelpPosts({
  status,
  urgency,
  post_type,
  category,
  lat,
  lng,
  radius_km,
} = {}) {
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
  if (post_type) {
    params.push(post_type);
    clauses.push(`hp.post_type = $${params.length}`);
  }
  if (category) {
    params.push(category);
    clauses.push(`hp.category = $${params.length}`);
  }

  const hasNearby =
    lat != null &&
    lng != null &&
    radius_km != null &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lng)) &&
    !Number.isNaN(Number(radius_km));

  let distanceSelect = "NULL::float AS distance_km";
  if (hasNearby) {
    params.push(Number(lat), Number(lng), Number(radius_km));
    const latIdx = params.length - 2;
    const lngIdx = params.length - 1;
    const radiusIdx = params.length;
    // Re-push lat/lng for the SELECT formula — cleaner to reuse indices
    // Actually we already pushed all three. Use latIdx, lngIdx, radiusIdx.
    clauses.push(`hp.lat IS NOT NULL AND hp.lng IS NOT NULL`);
    clauses.push(`(
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($${latIdx})) * cos(radians(hp.lat)) * cos(radians(hp.lng) - radians($${lngIdx}))
          + sin(radians($${latIdx})) * sin(radians(hp.lat))
        ))
      )
    ) <= $${radiusIdx}`);
    distanceSelect = `(
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($${latIdx})) * cos(radians(hp.lat)) * cos(radians(hp.lng) - radians($${lngIdx}))
          + sin(radians($${latIdx})) * sin(radians(hp.lat))
        ))
      )
    ) AS distance_km`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderBy = hasNearby
    ? `distance_km ASC NULLS LAST, hp.created_at DESC`
    : `CASE
        WHEN hp.urgency_level = 'urgent' THEN 1
        WHEN hp.urgency_level = 'medium' THEN 2
        WHEN hp.urgency_level = 'low' THEN 3
        ELSE 4
      END,
      hp.created_at DESC`;

  const result = await pool.query(
    `
    SELECT hp.*, u.name as requester_name,
           helper.name as helper_name,
           (SELECT COUNT(*) FROM help_post_comments
            WHERE help_post_comments.help_post_id = hp.help_post_id) as comment_count,
           ${distanceSelect}
    FROM help_post hp
    JOIN users u ON hp.created_by = u.user_id
    LEFT JOIN users helper ON hp.claimed_by = helper.user_id
    ${where}
    ORDER BY ${orderBy}
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

export async function updateHelpPost(
  postId,
  {
    status,
    clearClaim = false,
    title,
    details,
    location,
    urgency_level,
    post_type,
    category,
    lat,
    lng,
  } = {}
) {
  const result = await pool.query(
    `UPDATE help_post
     SET status = COALESCE($2, status),
         claimed_by = CASE WHEN $3 THEN NULL ELSE claimed_by END,
         title = COALESCE($4, title),
         details = COALESCE($5, details),
         location = COALESCE($6, location),
         urgency_level = COALESCE($7, urgency_level),
         post_type = COALESCE($8, post_type),
         category = COALESCE($9, category),
         lat = COALESCE($10, lat),
         lng = COALESCE($11, lng)
     WHERE help_post_id = $1
     RETURNING *`,
    [
      postId,
      status ?? null,
      clearClaim,
      title ?? null,
      details ?? null,
      location ?? null,
      urgency_level ?? null,
      post_type ?? null,
      category ?? null,
      lat ?? null,
      lng ?? null,
    ]
  );
  return result.rows[0] || null;
}

export async function deleteHelpPost(postId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM help_post_comments WHERE help_post_id = $1`, [
      postId,
    ]);
    const result = await client.query(
      `DELETE FROM help_post WHERE help_post_id = $1 RETURNING help_post_id`,
      [postId]
    );
    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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

/** Nearby users with coordinates (for invite matching). */
export async function findNearbyUsers({ lat, lng, radius_km = 10, excludeUserId, limit = 20 }) {
  const result = await pool.query(
    `
    SELECT user_id, name, skills, causes, lat, lng,
      (
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
            + sin(radians($1)) * sin(radians(lat))
          ))
        )
      ) AS distance_km
    FROM users
    WHERE lat IS NOT NULL AND lng IS NOT NULL
      AND ($3::int IS NULL OR user_id <> $3)
      AND (
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
            + sin(radians($1)) * sin(radians(lat))
          ))
        )
      ) <= $4
    ORDER BY distance_km ASC
    LIMIT $5
    `,
    [lat, lng, excludeUserId ?? null, radius_km, limit]
  );
  return result.rows;
}

export async function createInvite({
  help_post_id,
  invited_user_id,
  invited_by,
}) {
  const result = await pool.query(
    `INSERT INTO help_post_invites (help_post_id, invited_user_id, invited_by)
     VALUES ($1,$2,$3)
     ON CONFLICT (help_post_id, invited_user_id)
     DO UPDATE SET
       status = CASE
         WHEN help_post_invites.status = 'declined' THEN 'pending'
         ELSE help_post_invites.status
       END,
       invited_by = EXCLUDED.invited_by,
       responded_at = CASE
         WHEN help_post_invites.status = 'declined' THEN NULL
         ELSE help_post_invites.responded_at
       END
     RETURNING *`,
    [help_post_id, invited_user_id, invited_by]
  );
  return result.rows[0];
}

export async function listInvitesForPost(postId) {
  const result = await pool.query(
    `SELECT i.*, u.name as invited_user_name
     FROM help_post_invites i
     JOIN users u ON u.user_id = i.invited_user_id
     WHERE i.help_post_id = $1
     ORDER BY i.created_at DESC`,
    [postId]
  );
  return result.rows;
}

export async function listInvitesForUser(userId, { status } = {}) {
  const params = [userId];
  let statusClause = "";
  if (status) {
    params.push(status);
    statusClause = `AND i.status = $${params.length}`;
  }
  const result = await pool.query(
    `SELECT i.*, hp.title, hp.category, hp.post_type, hp.status as post_status,
            owner.name as owner_name
     FROM help_post_invites i
     JOIN help_post hp ON hp.help_post_id = i.help_post_id
     JOIN users owner ON owner.user_id = hp.created_by
     WHERE i.invited_user_id = $1 ${statusClause}
     ORDER BY i.created_at DESC`,
    params
  );
  return result.rows;
}

export async function findInviteById(inviteId) {
  const result = await pool.query(
    `SELECT i.*, hp.created_by as post_owner_id, hp.status as post_status,
            hp.claimed_by, hp.title, hp.location, hp.lat as post_lat, hp.lng as post_lng
     FROM help_post_invites i
     JOIN help_post hp ON hp.help_post_id = i.help_post_id
     WHERE i.id = $1`,
    [inviteId]
  );
  return result.rows[0] || null;
}

export async function respondToInvite(
  inviteId,
  { status, shared_contact = null, meeting_time = null }
) {
  const result = await pool.query(
    `UPDATE help_post_invites
     SET status = $2,
         shared_contact = COALESCE($3, shared_contact),
         meeting_time = COALESCE($4, meeting_time),
         responded_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [inviteId, status, shared_contact ? JSON.stringify(shared_contact) : null, meeting_time]
  );
  return result.rows[0] || null;
}

export async function createReview({
  help_post_id,
  reviewer_id,
  reviewee_id,
  rating,
  comment,
}) {
  const result = await pool.query(
    `INSERT INTO help_post_reviews
       (help_post_id, reviewer_id, reviewee_id, rating, comment)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (help_post_id, reviewer_id)
     DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
     RETURNING *`,
    [help_post_id, reviewer_id, reviewee_id, rating, comment || null]
  );
  return result.rows[0];
}

export async function listReviewsForPost(postId) {
  const result = await pool.query(
    `SELECT r.*, u.name as reviewer_name
     FROM help_post_reviews r
     JOIN users u ON u.user_id = r.reviewer_id
     WHERE r.help_post_id = $1
     ORDER BY r.created_at DESC`,
    [postId]
  );
  return result.rows;
}

export async function createReport(row) {
  const result = await pool.query(
    `INSERT INTO moderation_reports
       (reporter_id, target_type, target_id, reason, details)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [row.reporter_id, row.target_type, row.target_id, row.reason, row.details || null]
  );
  return result.rows[0];
}

export async function listReports({ status } = {}) {
  const params = [];
  let where = "";
  if (status) {
    params.push(status);
    where = `WHERE r.status = $${params.length}`;
  }
  const result = await pool.query(
    `SELECT r.*, u.name as reporter_name
     FROM moderation_reports r
     JOIN users u ON u.user_id = r.reporter_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT 200`,
    params
  );
  return result.rows;
}

export async function resolveReport(id, { status, resolved_by, resolution_note }) {
  const result = await pool.query(
    `UPDATE moderation_reports
     SET status = $2,
         resolved_by = $3,
         resolution_note = $4,
         resolved_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, resolved_by, resolution_note || null]
  );
  return result.rows[0] || null;
}

export async function findReportById(id) {
  const result = await pool.query(`SELECT * FROM moderation_reports WHERE id = $1`, [id]);
  return result.rows[0] || null;
}
