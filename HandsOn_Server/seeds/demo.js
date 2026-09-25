import bcrypt from "bcrypt";

/**
 * Demo seed for portfolio walkthroughs.
 * Idempotent: skips if demo organizer already exists.
 *
 * Usage: npm run seed
 */
import "dotenv/config";
import pool from "../db.js";

const DEMO_EMAIL = "demo.organizer@handson.local";

async function seed() {
  const existing = await pool.query("SELECT user_id FROM users WHERE email = $1", [
    DEMO_EMAIL,
  ]);

  if (existing.rowCount > 0) {
    console.log("Seed skipped — demo users already present");
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash("DemoPass123!", 10);

  const organizer = await pool.query(
    `INSERT INTO users (name, gender, dob, email, password, about, skills, causes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING user_id`,
    [
      "Demo Organizer",
      "other",
      "1995-05-15",
      DEMO_EMAIL,
      passwordHash,
      "HandsOn demo organizer account",
      ["leadership", "event planning"],
      ["education", "environment"],
    ]
  );

  const volunteer = await pool.query(
    `INSERT INTO users (name, gender, dob, email, password, about, skills, causes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING user_id`,
    [
      "Demo Volunteer",
      "other",
      "1998-08-20",
      "demo.volunteer@handson.local",
      passwordHash,
      "HandsOn demo volunteer account",
      ["teaching", "gardening"],
      ["education", "community"],
    ]
  );

  const orgId = organizer.rows[0].user_id;
  const volId = volunteer.rows[0].user_id;

  const event = await pool.query(
    `INSERT INTO events (title, details, date, location, start_time, end_time, category, member_limit, total_member, created_by, starts_at, ends_at)
     VALUES (
       $1,$2,CURRENT_DATE + 7,'Community Center','09:00','12:00','education',20,1,$3,
       ((CURRENT_DATE + 7)::text || ' 09:00:00')::timestamp AT TIME ZONE 'UTC',
       ((CURRENT_DATE + 7)::text || ' 12:00:00')::timestamp AT TIME ZONE 'UTC'
     )
     RETURNING id`,
    [
      "Park Cleanup Demo",
      "Demo event for portfolio walkthrough — help clean the local park.",
      orgId,
    ]
  );

  // Seed volunteer as registrant — organizers stay out of join_event.
  await pool.query(
    `INSERT INTO join_event (event_id, user_id, join_date, status)
     VALUES ($1,$2,CURRENT_DATE,'registered')`,
    [event.rows[0].id, volId]
  );

  const team = await pool.query(
    `INSERT INTO teams (name, description, category, is_private, created_by)
     VALUES ($1,$2,$3,false,$4) RETURNING id`,
    [
      "Green Hands Demo Team",
      "Demo team for portfolio walkthrough",
      "environment",
      orgId,
    ]
  );

  await pool.query(
    `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'admin')`,
    [team.rows[0].id, orgId]
  );

  await pool.query(
    `INSERT INTO help_post
       (created_by, title, details, location, urgency_level, post_type, category, lat, lng)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      volId,
      "After-school tutoring help",
      "Need help tutoring kids after school this week (demo help post).",
      "Library Room B",
      "medium",
      "ask",
      "tutoring",
      23.7808,
      90.4072,
    ]
  );

  console.log("Seed complete");
  console.log("  demo.organizer@handson.local / DemoPass123!");
  console.log("  demo.volunteer@handson.local / DemoPass123!");
  await pool.end();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await pool.end();
  process.exit(1);
});
