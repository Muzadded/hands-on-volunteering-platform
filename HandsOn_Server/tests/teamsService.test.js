import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/teamsRepository.js", () => ({
  createTeam: vi.fn(),
  addMember: vi.fn(),
  listTeams: vi.fn(),
  findTeamById: vi.fn(),
  isMember: vi.fn(),
  findTeamWithMembership: vi.fn(),
  listMembers: vi.fn(),
  getMemberRole: vi.fn(),
  updateTeam: vi.fn(),
  removeMember: vi.fn(),
  createInvite: vi.fn(),
  findInviteByCode: vi.fn(),
}));

vi.mock("../src/services/notificationsService.js", () => ({
  notify: vi.fn(),
}));

import * as teamsRepo from "../src/repositories/teamsRepository.js";
import { getTeam } from "../src/services/teamsService.js";

describe("teamsService private team privacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies private team details to non-members", async () => {
    teamsRepo.findTeamWithMembership.mockResolvedValue({
      id: 5,
      name: "Secret",
      is_private: true,
      is_member: false,
      member_count: "3",
    });

    await expect(getTeam(5, 99)).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringMatching(/private/i),
    });
    expect(teamsRepo.listMembers).not.toHaveBeenCalled();
  });

  it("returns members for private team members", async () => {
    teamsRepo.findTeamWithMembership.mockResolvedValue({
      id: 5,
      name: "Secret",
      is_private: true,
      is_member: true,
      member_count: "2",
    });
    teamsRepo.listMembers.mockResolvedValue([{ user_id: 1, name: "Owner" }]);
    teamsRepo.getMemberRole.mockResolvedValue("member");

    const team = await getTeam(5, 1);
    expect(team.members).toHaveLength(1);
    expect(team.my_role).toBe("member");
  });
});
