import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/eventsRepository.js", () => ({
  createEvent: vi.fn(),
  findById: vi.fn(),
  insertJoin: vi.fn(),
  listEvents: vi.fn(),
  joinEventTransactional: vi.fn(),
  listRegistrants: vi.fn(),
  updateAttendance: vi.fn(),
  attendedEventsForUser: vi.fn(),
  updateEvent: vi.fn(),
  cancelEvent: vi.fn(),
  withdrawTransactional: vi.fn(),
  listActiveRegistrantUserIds: vi.fn(),
  createShift: vi.fn(),
  listShifts: vi.fn(),
  setCheckInOut: vi.fn(),
  signWaiver: vi.fn(),
  findByShareSlug: vi.fn(),
  findByCheckinToken: vi.fn(),
}));

vi.mock("../src/repositories/usersRepository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../src/services/notificationsService.js", () => ({
  notify: vi.fn(),
  scheduleEventReminders: vi.fn(async () => []),
  cancelEventReminderJobs: vi.fn(async () => []),
  enqueueThankYou: vi.fn(async () => null),
}));

vi.mock("../src/services/organizationsService.js", () => ({
  assertCanManageOrgEvents: vi.fn(async () => true),
}));

vi.mock("../src/repositories/credentialsRepository.js", () => ({
  hasTypes: vi.fn(async () => true),
  listForUser: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));

import * as eventsRepo from "../src/repositories/eventsRepository.js";
import {
  createEvent,
  joinEvent,
  markAttendance,
  withdrawFromEvent,
  cancelEvent,
  checkIn,
} from "../src/services/eventsService.js";

describe("eventsService trust guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEvent does not auto-join the organizer", async () => {
    eventsRepo.createEvent.mockResolvedValue({ id: 10, created_by: 1 });

    const result = await createEvent(1, {
      title: "Park Cleanup",
      details: "help",
      date: "2032-01-01",
      location: "Park",
      start_time: "09:00",
      end_time: "11:00",
      category: "environment",
      member_limit: 5,
      tags: ["environment"],
    });

    expect(eventsRepo.insertJoin).not.toHaveBeenCalled();
    expect(result.joinData).toBeUndefined();
    expect(result.event.id).toBe(10);
  });

  it("blocks organizers from joining their own event", async () => {
    eventsRepo.findById.mockResolvedValue({ id: 10, created_by: 1, title: "X", status: "open" });

    await expect(joinEvent(1, 10)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/organizer/i),
    });
    expect(eventsRepo.joinEventTransactional).not.toHaveBeenCalled();
  });

  it("blocks organizers from marking their own attendance", async () => {
    eventsRepo.findById.mockResolvedValue({ id: 10, created_by: 1, title: "X" });

    await expect(markAttendance(1, 10, 1, "attended")).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/own attendance/i),
    });
    expect(eventsRepo.updateAttendance).not.toHaveBeenCalled();
  });

  it("promotes waitlist on withdraw", async () => {
    eventsRepo.withdrawTransactional.mockResolvedValue({
      withdrawn: { user_id: 2 },
      promoted: { user_id: 3 },
      organizerId: 1,
      eventTitle: "Park",
    });
    const result = await withdrawFromEvent(2, 10);
    expect(result.promoted.user_id).toBe(3);
  });

  it("cancels event as organizer", async () => {
    eventsRepo.findById.mockResolvedValue({ id: 10, created_by: 1, title: "X", status: "open" });
    eventsRepo.cancelEvent.mockResolvedValue({ id: 10, status: "cancelled", title: "X" });
    eventsRepo.listActiveRegistrantUserIds.mockResolvedValue([2, 3]);
    const cancelled = await cancelEvent(1, 10, "rain");
    expect(cancelled.status).toBe("cancelled");
  });

  it("checks in volunteer with organizer token", async () => {
    eventsRepo.findById.mockResolvedValue({
      id: 10,
      created_by: 1,
      checkin_token: "tok",
      title: "X",
    });
    eventsRepo.setCheckInOut.mockResolvedValue({ user_id: 2, check_in_at: new Date() });
    const row = await checkIn(2, 10, { token: "tok" });
    expect(row.user_id).toBe(2);
  });
});
