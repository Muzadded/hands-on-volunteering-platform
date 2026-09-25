import pool from "../../db.js";

export async function createTemplate(row) {
  const result = await pool.query(
    `INSERT INTO message_templates
      (organization_id, created_by, name, channel, subject, body)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      row.organization_id || null,
      row.created_by,
      row.name,
      row.channel || "all",
      row.subject || null,
      row.body,
    ]
  );
  return result.rows[0];
}

export async function listTemplates({ userId, organizationId } = {}) {
  const clauses = [];
  const params = [];
  if (organizationId) {
    params.push(organizationId);
    clauses.push(`organization_id = $${params.length}`);
  } else if (userId) {
    params.push(userId);
    clauses.push(`(created_by = $${params.length} OR organization_id IS NULL)`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM message_templates ${where} ORDER BY created_at DESC`,
    params
  );
  return result.rows;
}

export async function findTemplate(id) {
  const result = await pool.query(`SELECT * FROM message_templates WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function logMessage(row) {
  const result = await pool.query(
    `INSERT INTO message_logs (user_id, channel, template_id, subject, body, status, meta)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
     RETURNING *`,
    [
      row.user_id || null,
      row.channel,
      row.template_id || null,
      row.subject || null,
      row.body || null,
      row.status || "sent",
      JSON.stringify(row.meta || {}),
    ]
  );
  return result.rows[0];
}

export function renderTemplate(text, vars = {}) {
  return String(text || "").replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars[key] != null ? String(vars[key]) : "";
  });
}
