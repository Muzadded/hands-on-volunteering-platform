import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/organizationsRepository.js", () => ({
  createOrganization: vi.fn(),
  addMember: vi.fn(),
  listOrganizations: vi.fn(),
  listForUser: vi.fn(),
  findById: vi.fn(),
  findBySlug: vi.fn(),
  listMembers: vi.fn(),
  getMemberRole: vi.fn(),
  updateOrganization: vi.fn(),
  setVerified: vi.fn(),
}));

vi.mock("../src/repositories/usersRepository.js", () => ({
  findById: vi.fn(),
}));

import * as orgsRepo from "../src/repositories/organizationsRepository.js";
import * as usersRepo from "../src/repositories/usersRepository.js";
import {
  createOrganization,
  verifyOrganization,
  assertCanManageOrgEvents,
} from "../src/services/organizationsService.js";

describe("organizationsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates org and assigns creator as owner", async () => {
    orgsRepo.createOrganization.mockResolvedValue({ id: 1, name: "Helping Hands" });
    orgsRepo.addMember.mockResolvedValue({ role: "owner" });

    const org = await createOrganization(9, { name: "Helping Hands" });
    expect(org.id).toBe(1);
    expect(orgsRepo.addMember).toHaveBeenCalledWith(1, 9, "owner");
  });

  it("only allows platform admins to verify", async () => {
    usersRepo.findById.mockResolvedValue({ user_id: 2, platform_role: "user" });
    await expect(verifyOrganization(2, 1, true)).rejects.toMatchObject({
      statusCode: 403,
    });

    usersRepo.findById.mockResolvedValue({ user_id: 1, platform_role: "admin" });
    orgsRepo.setVerified.mockResolvedValue({ id: 1, verified_at: new Date() });
    const updated = await verifyOrganization(1, 1, true);
    expect(updated.id).toBe(1);
  });

  it("requires staff role to manage org events", async () => {
    orgsRepo.getMemberRole.mockResolvedValueOnce(null);
    await expect(assertCanManageOrgEvents(3, 10)).rejects.toMatchObject({
      statusCode: 403,
    });
    orgsRepo.getMemberRole.mockResolvedValueOnce("coordinator");
    await expect(assertCanManageOrgEvents(3, 10)).resolves.toBe(true);
  });
});
