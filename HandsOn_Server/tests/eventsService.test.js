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
}));

vi.mock("../src/repositories/usersRepository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../src/services/notificationsService.js", () => ({
  notify: vi.fn(),
}));

import * as eventsRepo from "../src/repositories/eventsRepository.js";
import {
  createEvent,
  joinEvent,
  markAttendance,
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
    eventsRepo.findById.mockResolvedValue({ id: 10, created_by: 1, title: "X" });

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
});
