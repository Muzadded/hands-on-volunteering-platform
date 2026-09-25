import pool from "../../db.js";

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function createOrganization(row) {
  const base = slugify(row.name) || `org-${Date.now()}`;
  let slug = base;
  for (let i = 0; i < 5; i += 1) {
    try {
      const result = await pool.query(
        `INSERT INTO organizations
          (name, slug, logo_url, description, contact_email, contact_phone, website, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          row.name,
          slug,
          row.logo_url || null,
          row.description || null,
          row.contact_email || null,
          row.contact_phone || null,
          row.website || null,
          row.created_by,
        ]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        slug = `${base}-${i + 1}`;
        continue;
      }
      throw error;
    }
  }
  throw Object.assign(new Error("Could not allocate unique organization slug"), {
    statusCode: 400,
  });
}

export async function findById(id) {
  const result = await pool.query("SELECT * FROM organizations WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function findBySlug(slug) {
  const result = await pool.query("SELECT * FROM organizations WHERE slug = $1", [
    slug,
  ]);
  return result.rows[0] || null;
}

export async function listOrganizations({ verifiedOnly = false } = {}) {
  const result = await pool.query(
    `SELECT o.*,
            (SELECT COUNT(*)::int FROM organization_members om WHERE om.organization_id = o.id) AS member_count,
            (SELECT COUNT(*)::int FROM events e WHERE e.organization_id = o.id) AS event_count
     FROM organizations o
     ${verifiedOnly ? "WHERE o.verified_at IS NOT NULL" : ""}
     ORDER BY o.verified_at DESC NULLS LAST, o.created_at DESC`
  );
  return result.rows;
}

export async function updateOrganization(id, patch) {
  const result = await pool.query(
    `UPDATE organizations
     SET name = COALESCE($2, name),
         logo_url = COALESCE($3, logo_url),
         description = COALESCE($4, description),
         contact_email = COALESCE($5, contact_email),
         contact_phone = COALESCE($6, contact_phone),
         website = COALESCE($7, website),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      patch.name ?? null,
      patch.logo_url ?? null,
      patch.description ?? null,
      patch.contact_email ?? null,
      patch.contact_phone ?? null,
      patch.website ?? null,
    ]
  );
  return result.rows[0] || null;
}

export async function setVerified(id, verifiedBy, verified) {
  const result = await pool.query(
    `UPDATE organizations
     SET verified_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
         verified_by = CASE WHEN $2 THEN $3 ELSE NULL END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, Boolean(verified), verifiedBy]
  );
  return result.rows[0] || null;
}

export async function addMember(organizationId, userId, role = "coordinator") {
  const result = await pool.query(
    `INSERT INTO organization_members (organization_id, user_id, role)
     VALUES ($1,$2,$3)
     ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role
     RETURNING *`,
    [organizationId, userId, role]
  );
  return result.rows[0];
}

export async function getMemberRole(organizationId, userId) {
  const result = await pool.query(
    `SELECT role FROM organization_members
     WHERE organization_id = $1 AND user_id = $2`,
    [organizationId, userId]
  );
  return result.rows[0]?.role || null;
}

export async function listMembers(organizationId) {
  const result = await pool.query(
    `SELECT om.role, om.joined_at, u.user_id, u.name, u.email
     FROM organization_members om
     JOIN users u ON u.user_id = om.user_id
     WHERE om.organization_id = $1
     ORDER BY
       CASE WHEN om.role = 'owner' THEN 1 ELSE 2 END,
       om.joined_at ASC`,
    [organizationId]
  );
  return result.rows;
}

export async function listForUser(userId) {
  const result = await pool.query(
    `SELECT o.*, om.role AS my_role
     FROM organizations o
     JOIN organization_members om ON om.organization_id = o.id
     WHERE om.user_id = $1
     ORDER BY o.name ASC`,
    [userId]
  );
  return result.rows;
}

export async function isVerified(organizationId) {
  if (!organizationId) return false;
  const result = await pool.query(
    `SELECT 1 FROM organizations WHERE id = $1 AND verified_at IS NOT NULL`,
    [organizationId]
  );
  return result.rowCount > 0;
}
