import pool from "../../db.js";
import { randomBytes } from "crypto";

const ACTIVE_JOIN_STATUSES = `('registered', 'waitlisted', 'attended', 'no_show')`;
const SEAT_STATUSES = `('registered', 'attended', 'no_show')`;

export async function createEvent(row) {
  const shareSlug = row.share_slug || randomBytes(8).toString("hex");
  const checkinToken = row.checkin_token || randomBytes(16).toString("hex");
  const result = await pool.query(
    `INSERT INTO events
      (title, details, date, location, start_time, end_time, category, member_limit,
       total_member, created_by, tags, starts_at, ends_at, organization_id,
       share_slug, checkin_token, recurrence_rule, recurrence_parent_id,
       waiver_text, min_age, required_credentials)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      row.title,
      row.details,
      row.date,
      row.location,
      row.start_time,
      row.end_time,
      row.category,
      row.member_limit,
      row.created_by,
      row.tags || [],
      row.starts_at || null,
      row.ends_at || null,
      row.organization_id || null,
      shareSlug,
      checkinToken,
      row.recurrence_rule || null,
      row.recurrence_parent_id || null,
      row.waiver_text || null,
      row.min_age ?? null,
      row.required_credentials || [],
    ]
  );
  return result.rows[0];
}

export async function findById(eventId) {
  const result = await pool.query("SELECT * FROM events WHERE id = $1", [eventId]);
  return result.rows[0] || null;
}

export async function findByShareSlug(slug) {
  const result = await pool.query("SELECT * FROM events WHERE share_slug = $1", [
    slug,
  ]);
  return result.rows[0] || null;
}

export async function findByCheckinToken(token) {
  const result = await pool.query(
    "SELECT * FROM events WHERE checkin_token = $1",
    [token]
  );
  return result.rows[0] || null;
}

export async function updateEvent(eventId, patch) {
  const result = await pool.query(
    `UPDATE events
     SET title = COALESCE($2, title),
         details = COALESCE($3, details),
         date = COALESCE($4, date),
         location = COALESCE($5, location),
         start_time = COALESCE($6, start_time),
         end_time = COALESCE($7, end_time),
         category = COALESCE($8, category),
         member_limit = COALESCE($9, member_limit),
         tags = COALESCE($10, tags),
         starts_at = COALESCE($11, starts_at),
         ends_at = COALESCE($12, ends_at),
         waiver_text = COALESCE($13, waiver_text),
         min_age = COALESCE($14, min_age),
         required_credentials = COALESCE($15, required_credentials)
     WHERE id = $1 AND status = 'open'
     RETURNING *`,
    [
      eventId,
      patch.title ?? null,
      patch.details ?? null,
      patch.date ?? null,
      patch.location ?? null,
      patch.start_time ?? null,
      patch.end_time ?? null,
      patch.category ?? null,
      patch.member_limit ?? null,
      patch.tags ?? null,
      patch.starts_at ?? null,
      patch.ends_at ?? null,
      patch.waiver_text ?? null,
      patch.min_age ?? null,
      patch.required_credentials ?? null,
    ]
  );
  return result.rows[0] || null;
}

export async function cancelEvent(eventId, reason) {
  const result = await pool.query(
    `UPDATE events
     SET status = 'cancelled',
         cancelled_at = NOW(),
         cancel_reason = $2
     WHERE id = $1 AND status = 'open'
     RETURNING *`,
    [eventId, reason || null]
  );
  return result.rows[0] || null;
}

export async function listActiveRegistrantUserIds(eventId) {
  const result = await pool.query(
    `SELECT user_id FROM join_event
     WHERE event_id = $1 AND status IN ${ACTIVE_JOIN_STATUSES}`,
    [eventId]
  );
  return result.rows.map((r) => r.user_id);
}

export async function insertJoin(eventId, userId, joinDate) {
  const result = await pool.query(
    `INSERT INTO join_event (event_id, user_id, join_date, status)
     VALUES ($1,$2,$3,'registered') RETURNING *`,
    [eventId, userId, joinDate]
  );
  return result.rows[0];
}

function seatsSql(alias = "je") {
  return `COALESCE(SUM(CASE WHEN ${alias}.status IN ${SEAT_STATUSES}
    THEN 1 + COALESCE(${alias}.guest_count, 0) ELSE 0 END), 0)`;
}

export async function listEvents(userId = null, filters = {}) {
  const {
    upcoming = true,
    available = false,
    page = 1,
    limit = 50,
    includeCancelled = false,
  } = filters;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const offset = (safePage - 1) * safeLimit;

  const where = [];
  if (!includeCancelled) {
    where.push(`e.status = 'open'`);
  }
  if (upcoming) {
    where.push(
      `(COALESCE(e.starts_at, (e.date::text || ' 00:00:00')::timestamp AT TIME ZONE 'UTC') >= NOW())`
    );
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const having = [];
  if (available) {
    having.push(`${seatsSql("je")} < e.member_limit`);
  }
  const havingSql = having.length ? `HAVING ${having.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*)::int AS total FROM (
      SELECT e.id
      FROM events e
      LEFT JOIN join_event je ON e.id = je.event_id
      ${whereSql}
      GROUP BY e.id, e.member_limit
      ${havingSql}
    ) counted
  `;
  const countResult = await pool.query(countQuery);
  const total = countResult.rows[0]?.total || 0;

  const listParams = [];
  let userJoinedExpr = "FALSE";
  if (userId != null) {
    listParams.push(userId);
    userJoinedExpr = `EXISTS(
      SELECT 1 FROM join_event
      WHERE event_id = e.id AND user_id = $1
        AND status IN ${ACTIVE_JOIN_STATUSES}
    )`;
  }

  listParams.push(safeLimit);
  const limitParam = `$${listParams.length}`;
  listParams.push(offset);
  const offsetParam = `$${listParams.length}`;

  const query = `
    SELECT e.*,
           ${seatsSql("je")}::int as registered_volunteers,
           ${userJoinedExpr} as user_joined
    FROM events e
    LEFT JOIN join_event je ON e.id = je.event_id
    ${whereSql}
    GROUP BY e.id
    ${havingSql}
    ORDER BY e.date ASC, e.start_time ASC NULLS LAST
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;
  const result = await pool.query(query, listParams);
  return {
    items: result.rows,
    page: safePage,
    limit: safeLimit,
    total,
    hasMore: offset + result.rows.length < total,
  };
}

export async function listRegistrants(eventId) {
  const result = await pool.query(
    `SELECT je.join_id, je.user_id, je.status, je.join_date, je.guest_count,
            je.shift_id, je.check_in_at, je.check_out_at, je.waiver_signed_at,
            u.name, u.email
     FROM join_event je
     JOIN users u ON u.user_id = je.user_id
     WHERE je.event_id = $1 AND je.status <> 'withdrawn'
     ORDER BY
       CASE je.status
         WHEN 'waitlisted' THEN 2
         ELSE 1
       END,
       je.join_date ASC, u.name ASC`,
    [eventId]
  );
  return result.rows;
}

export async function updateAttendance(eventId, userId, status) {
  const result = await pool.query(
    `UPDATE join_event
     SET status = $3
     WHERE event_id = $1 AND user_id = $2
       AND status IN ('registered', 'attended', 'no_show', 'waitlisted')
     RETURNING *`,
    [eventId, userId, status]
  );
  return result.rows[0] || null;
}

export async function joinEventTransactional(
  eventId,
  userId,
  joinDate,
  { guestCount = 0, shiftId = null, allowWaitlist = true } = {}
) {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const eventCheck = await db.query(
      `SELECT id, member_limit, created_by, title, status
       FROM events WHERE id = $1 FOR UPDATE`,
      [eventId]
    );
    if (eventCheck.rows.length === 0) {
      throw Object.assign(new Error("Event not found"), { statusCode: 404 });
    }

    const event = eventCheck.rows[0];
    if (event.status === "cancelled") {
      throw Object.assign(new Error("Event has been cancelled"), { statusCode: 400 });
    }
    if (String(event.created_by) === String(userId)) {
      throw Object.assign(
        new Error("Organizers cannot join their own event as volunteers"),
        { statusCode: 400 }
      );
    }

    const seatsNeeded = 1 + Math.max(0, Number(guestCount) || 0);

    let shiftCapacity = null;
    if (shiftId) {
      const shift = await db.query(
        `SELECT id, capacity FROM event_shifts WHERE id = $1 AND event_id = $2 FOR UPDATE`,
        [shiftId, eventId]
      );
      if (!shift.rows[0]) {
        throw Object.assign(new Error("Shift not found for this event"), {
          statusCode: 404,
        });
      }
      shiftCapacity = shift.rows[0].capacity;
    }

    const countResult = await db.query(
      `SELECT ${seatsSql()}::int AS registered
       FROM join_event je
       WHERE je.event_id = $1
         ${shiftId ? "AND je.shift_id = $2" : "AND je.shift_id IS NULL"}`,
      shiftId ? [eventId, shiftId] : [eventId]
    );
    const registered = countResult.rows[0]?.registered || 0;
    const limit = shiftId ? shiftCapacity : event.member_limit;
    const hasRoom = registered + seatsNeeded <= limit;

    const existing = await db.query(
      `SELECT * FROM join_event WHERE event_id = $1 AND user_id = $2 FOR UPDATE`,
      [eventId, userId]
    );

    if (existing.rows[0] && existing.rows[0].status !== "withdrawn") {
      throw Object.assign(new Error("Already joined this event"), {
        statusCode: 400,
      });
    }

    let status = "registered";
    let waitlistedAt = null;
    if (!hasRoom) {
      if (!allowWaitlist || shiftId) {
        throw Object.assign(new Error("Event is already full"), { statusCode: 400 });
      }
      status = "waitlisted";
      waitlistedAt = new Date();
    }

    let joinData;
    if (existing.rows[0]) {
      joinData = await db.query(
        `UPDATE join_event
         SET status = $2,
             join_date = $3,
             guest_count = $4,
             shift_id = $5,
             waitlisted_at = $6,
             withdrawn_at = NULL,
             check_in_at = NULL,
             check_out_at = NULL
         WHERE join_id = $1
         RETURNING *`,
        [
          existing.rows[0].join_id,
          status,
          joinDate,
          guestCount,
          shiftId,
          waitlistedAt,
        ]
      );
    } else {
      joinData = await db.query(
        `INSERT INTO join_event
          (event_id, user_id, join_date, status, guest_count, shift_id, waitlisted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [eventId, userId, joinDate, status, guestCount, shiftId, waitlistedAt]
      );
    }

    const updatedEvent = await db.query(
      `UPDATE events
       SET total_member = (
         SELECT ${seatsSql()}::int FROM join_event je WHERE je.event_id = $1
       )
       WHERE id = $1
       RETURNING *`,
      [eventId]
    );

    await db.query("COMMIT");
    return {
      joinData: joinData.rows[0],
      event: updatedEvent.rows[0],
      organizerId: event.created_by,
      eventTitle: event.title,
      waitlisted: status === "waitlisted",
    };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}

export async function withdrawTransactional(eventId, userId) {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const event = await db.query(
      `SELECT id, created_by, title, member_limit, status
       FROM events WHERE id = $1 FOR UPDATE`,
      [eventId]
    );
    if (!event.rows[0]) {
      throw Object.assign(new Error("Event not found"), { statusCode: 404 });
    }

    const join = await db.query(
      `SELECT * FROM join_event
       WHERE event_id = $1 AND user_id = $2
         AND status IN ('registered', 'waitlisted', 'attended', 'no_show')
       FOR UPDATE`,
      [eventId, userId]
    );
    if (!join.rows[0]) {
      throw Object.assign(new Error("Registration not found"), { statusCode: 404 });
    }

    const wasHoldingSeat = ["registered", "attended", "no_show"].includes(
      join.rows[0].status
    );

    const withdrawn = await db.query(
      `UPDATE join_event
       SET status = 'withdrawn', withdrawn_at = NOW()
       WHERE join_id = $1
       RETURNING *`,
      [join.rows[0].join_id]
    );

    let promoted = null;
    if (wasHoldingSeat && event.rows[0].status === "open") {
      const next = await db.query(
        `SELECT * FROM join_event
         WHERE event_id = $1 AND status = 'waitlisted'
         ORDER BY waitlisted_at ASC NULLS LAST, join_id ASC
         LIMIT 1
         FOR UPDATE`,
        [eventId]
      );
      if (next.rows[0]) {
        const seatsHeld = await db.query(
          `SELECT ${seatsSql()}::int AS registered
           FROM join_event je WHERE je.event_id = $1`,
          [eventId]
        );
        const needed = 1 + (next.rows[0].guest_count || 0);
        if (
          (seatsHeld.rows[0]?.registered || 0) + needed <=
          event.rows[0].member_limit
        ) {
          promoted = (
            await db.query(
              `UPDATE join_event
               SET status = 'registered', waitlisted_at = NULL
               WHERE join_id = $1
               RETURNING *`,
              [next.rows[0].join_id]
            )
          ).rows[0];
        }
      }
    }

    await db.query(
      `UPDATE events
       SET total_member = (
         SELECT ${seatsSql()}::int FROM join_event je WHERE je.event_id = $1
       )
       WHERE id = $1`,
      [eventId]
    );

    await db.query("COMMIT");
    return {
      withdrawn: withdrawn.rows[0],
      promoted,
      organizerId: event.rows[0].created_by,
      eventTitle: event.rows[0].title,
    };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}

export async function setCheckInOut(eventId, userId, { checkIn = false, checkOut = false }) {
  if (checkIn) {
    const result = await pool.query(
      `UPDATE join_event
       SET check_in_at = COALESCE(check_in_at, NOW()),
           status = CASE WHEN status = 'registered' THEN 'attended' ELSE status END
       WHERE event_id = $1 AND user_id = $2
         AND status IN ('registered', 'attended')
       RETURNING *`,
      [eventId, userId]
    );
    return result.rows[0] || null;
  }
  if (checkOut) {
    const result = await pool.query(
      `UPDATE join_event
       SET check_out_at = NOW()
       WHERE event_id = $1 AND user_id = $2
         AND check_in_at IS NOT NULL
         AND status IN ('registered', 'attended')
       RETURNING *`,
      [eventId, userId]
    );
    return result.rows[0] || null;
  }
  return null;
}

export async function signWaiver(eventId, userId, signature) {
  const result = await pool.query(
    `UPDATE join_event
     SET waiver_signed_at = NOW(),
         waiver_signature = $3
     WHERE event_id = $1 AND user_id = $2
       AND status IN ${ACTIVE_JOIN_STATUSES}
     RETURNING *`,
    [eventId, userId, signature]
  );
  return result.rows[0] || null;
}

export async function createShift(row) {
  const result = await pool.query(
    `INSERT INTO event_shifts (event_id, role_name, starts_at, ends_at, capacity)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [row.event_id, row.role_name, row.starts_at, row.ends_at, row.capacity]
  );
  return result.rows[0];
}

export async function listShifts(eventId) {
  const result = await pool.query(
    `SELECT s.*,
            COALESCE(SUM(
              CASE WHEN je.status IN ${SEAT_STATUSES}
              THEN 1 + COALESCE(je.guest_count, 0) ELSE 0 END
            ), 0)::int AS filled
     FROM event_shifts s
     LEFT JOIN join_event je ON je.shift_id = s.id
     WHERE s.event_id = $1
     GROUP BY s.id
     ORDER BY s.starts_at ASC NULLS LAST, s.id ASC`,
    [eventId]
  );
  return result.rows;
}

export async function findShift(shiftId) {
  const result = await pool.query("SELECT * FROM event_shifts WHERE id = $1", [
    shiftId,
  ]);
  return result.rows[0] || null;
}

export async function attendedEventsForUser(userId) {
  const result = await pool.query(
    `SELECT e.*, je.status, je.join_date, je.check_in_at, je.check_out_at,
            (o.verified_at IS NOT NULL) AS org_verified
     FROM join_event je
     JOIN events e ON e.id = je.event_id
     LEFT JOIN organizations o ON o.id = e.organization_id
     WHERE je.user_id = $1 AND je.status = 'attended'`,
    [userId]
  );
  return result.rows;
}
