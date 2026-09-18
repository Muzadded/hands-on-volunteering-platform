import "dotenv/config";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("API integration", () => {
  let app;
  let tokenA;
  let tokenB;
  let _userA;
  let userB;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const mod = await import("../src/app.js");
    app = mod.createApp();

    const stamp = Date.now();
    const register = async (email, name) => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name,
          gender: "other",
          dob: "2000-01-01",
          email,
          password: "TestPass123!",
          about: "tester",
          skills: ["teaching"],
          causes: ["education"],
        });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeTruthy();
      return res.body;
    };

    const a = await register(`phase4a_${stamp}@test.local`, "User A");
    const b = await register(`phase4b_${stamp}@test.local`, "User B");
    tokenA = a.token;
    tokenB = b.token;
    _userA = a.data.user_id;
    userB = b.data.user_id;
  });

  it("rejects unauthenticated API access", async () => {
    const res = await request(app).get("/api/v1/events");
    expect(res.status).toBe(401);
  });

  it("blocks IDOR profile updates", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userB}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Hacker",
        gender: "other",
        dob: "2000-01-01",
        about: "nope",
        skills: ["x"],
        causes: ["education"],
      });
    expect(res.status).toBe(403);
  });

  it("enforces event capacity", async () => {
    const created = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Capacity Event",
        details: "full after creator",
        date: "2032-01-01",
        location: "Park",
        start_time: "09:00",
        end_time: "10:00",
        category: "Education",
        member_limit: 1,
        tags: ["education"],
      });
    expect(created.status).toBe(201);
    const eventId = created.body.data.event.id;

    const join = await request(app)
      .post(`/api/v1/events/${eventId}/join`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({});
    expect(join.status).toBe(400);
    expect(String(join.body.message).toLowerCase()).toContain("full");
  });

  it("returns recommended events with match scores", async () => {
    await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Teach Kids",
        details: "tutoring",
        date: "2032-02-01",
        location: "Library",
        start_time: "09:00",
        end_time: "11:00",
        category: "Education",
        member_limit: 20,
        tags: ["teaching", "education"],
      });

    const res = await request(app)
      .get("/api/v1/events/recommended")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((e) => e.matchScore > 0)).toBe(true);
  });

  it("exposes health endpoint", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});
