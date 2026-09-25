import * as orgsRepo from "../repositories/organizationsRepository.js";
import * as usersRepo from "../repositories/usersRepository.js";
import { AppError } from "../utils/response.js";

function assertStaff(role) {
  return role === "owner" || role === "coordinator";
}

export async function createOrganization(actorId, payload) {
  const org = await orgsRepo.createOrganization({
    ...payload,
    created_by: actorId,
  });
  await orgsRepo.addMember(org.id, actorId, "owner");
  return org;
}

export async function listOrganizations(filters = {}) {
  return orgsRepo.listOrganizations(filters);
}

export async function listMyOrganizations(actorId) {
  return orgsRepo.listForUser(actorId);
}

export async function getOrganization(idOrSlug) {
  const org =
    /^\d+$/.test(String(idOrSlug))
      ? await orgsRepo.findById(Number(idOrSlug))
      : await orgsRepo.findBySlug(String(idOrSlug));
  if (!org) throw new AppError("Organization not found", 404);
  const members = await orgsRepo.listMembers(org.id);
  return {
    ...org,
    verified: Boolean(org.verified_at),
    members: members.map((m) => ({
      user_id: m.user_id,
      name: m.name,
      role: m.role,
      joined_at: m.joined_at,
      // email only for later staff views; public get strips below if needed
      email: m.email,
    })),
    member_count: members.length,
  };
}

export async function updateOrganization(actorId, orgId, payload) {
  const role = await orgsRepo.getMemberRole(orgId, actorId);
  if (!assertStaff(role)) {
    throw new AppError("Only organization staff can edit the organization", 403);
  }
  const updated = await orgsRepo.updateOrganization(orgId, payload);
  if (!updated) throw new AppError("Organization not found", 404);
  return updated;
}

export async function verifyOrganization(actorId, orgId, verified = true) {
  const actor = await usersRepo.findById(actorId);
  if (!actor || actor.platform_role !== "admin") {
    throw new AppError("Only platform admins can verify organizations", 403);
  }
  const updated = await orgsRepo.setVerified(orgId, actorId, verified);
  if (!updated) throw new AppError("Organization not found", 404);
  return updated;
}

export async function assertCanManageOrgEvents(actorId, organizationId) {
  if (!organizationId) return true;
  const role = await orgsRepo.getMemberRole(organizationId, actorId);
  if (!assertStaff(role)) {
    throw new AppError("Not authorized for this organization", 403);
  }
  return true;
}

export async function getPublicOrganization(idOrSlug) {
  const data = await getOrganization(idOrSlug);
  return {
    ...data,
    members: data.members.map(({ email: _email, ...rest }) => rest),
    contact_email: data.verified ? data.contact_email : null,
  };
}
