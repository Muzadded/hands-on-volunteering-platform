import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/usersRepository.js", () => ({
  findById: vi.fn(),
  findJoinedEvents: vi.fn(),
  findJoinedTeams: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("../src/repositories/eventsRepository.js", () => ({
  attendedEventsForUser: vi.fn(),
}));

vi.mock("../src/repositories/helpPostsRepository.js", () => ({
  countContributions: vi.fn(),
}));

vi.mock("../src/repositories/credentialsRepository.js", () => ({
  listForUser: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  hasTypes: vi.fn(),
}));

import * as usersRepo from "../src/repositories/usersRepository.js";
import * as eventsRepo from "../src/repositories/eventsRepository.js";
import * as helpRepo from "../src/repositories/helpPostsRepository.js";
import { getUserProfile } from "../src/services/usersService.js";

describe("usersService profile privacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventsRepo.attendedEventsForUser.mockResolvedValue([]);
    usersRepo.findJoinedTeams.mockResolvedValue([]);
    helpRepo.countContributions.mockResolvedValue({
      created: 0,
      claimed: 0,
      comments: 0,
    });
  });

  it("hides email/dob/gender and private history from other users", async () => {
    usersRepo.findById.mockResolvedValue({
      user_id: 2,
      name: "Volunteer",
      email: "secret@test.local",
      gender: "other",
      dob: "2000-01-01",
      about: "hello",
      skills: ["teaching"],
      causes: ["education"],
    });

    const profile = await getUserProfile(1, 2);

    expect(profile.isSelf).toBe(false);
    expect(profile.user.email).toBeUndefined();
    expect(profile.user.dob).toBeUndefined();
    expect(profile.user.gender).toBeUndefined();
    expect(profile.user.name).toBe("Volunteer");
    expect(profile.joinedEvents).toBeUndefined();
    expect(profile.joinedTeams).toBeUndefined();
    expect(profile.impact.helpCreated).toBeUndefined();
    expect(usersRepo.findJoinedEvents).not.toHaveBeenCalled();
  });

  it("returns full private profile for self", async () => {
    usersRepo.findById.mockResolvedValue({
      user_id: 1,
      name: "Me",
      email: "me@test.local",
      gender: "other",
      dob: "2000-01-01",
      about: "bio",
      skills: [],
      causes: [],
    });
    usersRepo.findJoinedEvents.mockResolvedValue([]);
    usersRepo.findJoinedTeams.mockResolvedValue([]);

    const profile = await getUserProfile(1, 1);

    expect(profile.isSelf).toBe(true);
    expect(profile.user.email).toBe("me@test.local");
    expect(profile.joinedEvents).toEqual([]);
    expect(profile.impact.helpCreated).toBe(0);
  });
});
