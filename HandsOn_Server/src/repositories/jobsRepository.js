import pool from "../../db.js";

export async function enqueue({
  jobType,
  payload = {},
  runAt = new Date(),
  dedupeKey = null,
  maxAttempts = 5,
}) {
  if (dedupeKey) {
    await pool.query(
      `UPDATE background_jobs
       SET status = 'cancelled', completed_at = NOW()
       WHERE dedupe_key = $1 AND status IN ('pending', 'processing')`,
      [dedupeKey]
    );
  }

  const result = await pool.query(
    `INSERT INTO background_jobs (job_type, payload, run_at, dedupe_key, max_attempts)
     VALUES ($1, $2::jsonb, $3, $4, $5)
     RETURNING *`,
    [jobType, JSON.stringify(payload), runAt, dedupeKey, maxAttempts]
  );
  return result.rows[0];
}

export async function cancelByDedupePrefix(prefix) {
  const result = await pool.query(
    `UPDATE background_jobs
     SET status = 'cancelled', completed_at = NOW()
     WHERE dedupe_key LIKE $1 AND status IN ('pending', 'processing')
     RETURNING id`,
    [`${prefix}%`]
  );
  return result.rows;
}

export async function claimNextBatch(limit = 10) {
  const result = await pool.query(
    `WITH next_jobs AS (
       SELECT id
       FROM background_jobs
       WHERE status = 'pending' AND run_at <= NOW()
       ORDER BY run_at ASC, id ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $1
     )
     UPDATE background_jobs j
     SET status = 'processing',
         attempts = j.attempts + 1,
         started_at = NOW()
     FROM next_jobs
     WHERE j.id = next_jobs.id
     RETURNING j.*`,
    [limit]
  );
  return result.rows;
}

export async function markCompleted(id) {
  await pool.query(
    `UPDATE background_jobs
     SET status = 'completed', completed_at = NOW(), last_error = NULL
     WHERE id = $1`,
    [id]
  );
}

export async function markFailed(id, error, { retryDelayMs = 60_000, maxAttempts = 5 } = {}) {
  const row = await pool.query(`SELECT attempts, max_attempts FROM background_jobs WHERE id = $1`, [
    id,
  ]);
  const attempts = row.rows[0]?.attempts || 1;
  const cap = row.rows[0]?.max_attempts || maxAttempts;
  if (attempts >= cap) {
    await pool.query(
      `UPDATE background_jobs
       SET status = 'failed', last_error = $2, completed_at = NOW()
       WHERE id = $1`,
      [id, String(error).slice(0, 2000)]
    );
    return;
  }
  await pool.query(
    `UPDATE background_jobs
     SET status = 'pending',
         last_error = $2,
         run_at = NOW() + ($3::text || ' milliseconds')::interval
     WHERE id = $1`,
    [id, String(error).slice(0, 2000), retryDelayMs]
  );
}
