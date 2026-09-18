import pool from "../../db.js";

export async function createEvent(row) {
  const result = await pool.query(
    `INSERT INTO events
      (title, details, date, location, start_time, end_time, category, member_limit, created_by, tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
    ]
  );
  return result.rows[0];
}

export async function findById(eventId) {
  const result = await pool.query("SELECT * FROM events WHERE id = $1", [eventId]);
  return result.rows[0] || null;
}

export async function insertJoin(eventId, userId, joinDate) {
  const result = await pool.query(
    `INSERT INTO join_event (event_id, user_id, join_date, status)
     VALUES ($1,$2,$3,'registered') RETURNING *`,
    [eventId, userId, joinDate]
  );
  return result.rows[0];
}

export async function listEvents(userId = null) {
  const query = `
    SELECT e.*,
           COUNT(je.event_id) as registered_volunteers,
           ${
             userId
               ? "EXISTS(SELECT 1 FROM join_event WHERE event_id = e.id AND user_id = $1)"
               : "FALSE"
           } as user_joined
    FROM events e
    LEFT JOIN join_event je ON e.id = je.event_id
    GROUP BY e.id
    ORDER BY e.date DESC
  `;
  const result = await pool.query(query, userId ? [userId] : []);
  return result.rows;
}

export async function listRegistrants(eventId) {
  const result = await pool.query(
    `SELECT je.join_id, je.user_id, je.status, je.join_date, u.name, u.email
     FROM join_event je
     JOIN users u ON u.user_id = je.user_id
     WHERE je.event_id = $1
     ORDER BY je.join_date ASC, u.name ASC`,
    [eventId]
  );
  return result.rows;
}

export async function updateAttendance(eventId, userId, status) {
  const result = await pool.query(
    `UPDATE join_event
     SET status = $3
     WHERE event_id = $1 AND user_id = $2
     RETURNING *`,
    [eventId, userId, status]
  );
  return result.rows[0] || null;
}

export async function joinEventTransactional(eventId, userId, joinDate) {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const eventCheck = await db.query(
      "SELECT id, member_limit, created_by, title FROM events WHERE id = $1 FOR UPDATE",
      [eventId]
    );
    if (eventCheck.rows.length === 0) {
      throw Object.assign(new Error("Event not found"), { statusCode: 404 });
    }

    const event = eventCheck.rows[0];
    const countResult = await db.query(
      "SELECT COUNT(*)::int AS registered FROM join_event WHERE event_id = $1",
      [eventId]
    );
    const registered = countResult.rows[0].registered;

    if (registered >= event.member_limit) {
      throw Object.assign(new Error("Event is already full"), { statusCode: 400 });
    }

    const alreadyJoined = await db.query(
      "SELECT 1 FROM join_event WHERE event_id = $1 AND user_id = $2",
      [eventId, userId]
    );
    if (alreadyJoined.rows.length > 0) {
      throw Object.assign(new Error("Already joined this event"), {
        statusCode: 400,
      });
    }

    const joinData = await db.query(
      `INSERT INTO join_event (event_id, user_id, join_date, status)
       VALUES ($1,$2,$3,'registered') RETURNING *`,
      [eventId, userId, joinDate]
    );

    const updatedEvent = await db.query(
      `UPDATE events
       SET total_member = (SELECT COUNT(*) FROM join_event WHERE event_id = $1)
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
    };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}

export async function attendedEventsForUser(userId) {
  const result = await pool.query(
    `SELECT e.*, je.status, je.join_date
     FROM join_event je
     JOIN events e ON e.id = je.event_id
     WHERE je.user_id = $1 AND je.status = 'attended'`,
    [userId]
  );
  return result.rows;
}
