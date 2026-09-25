import * as teamsRepo from "../repositories/teamsRepository.js";
import * as notificationsService from "./notificationsService.js";
import { AppError } from "../utils/response.js";

function assertManager(role) {
  return role === "owner" || role === "admin";
}

export async function createTeam(actorId, payload) {
  const team = await teamsRepo.createTeam({
    name: payload.name,
    description: payload.description,
    category: payload.category,
    isPrivate: Boolean(payload.isPrivate),
    created_by: actorId,
  });
  const joinData = await teamsRepo.addMember(team.id, actorId, "owner");
  return { team, joinData };
}

export async function listTeams(actorId) {
  const rows = await teamsRepo.listTeams(actorId);
  return rows.map((team) => ({
    ...team,
    member_count: parseInt(team.member_count, 10) || 0,
    is_member: team.is_member || false,
  }));
}

export async function joinTeam(actorId, teamId) {
  const team = await teamsRepo.findTeamById(teamId);
  if (!team) throw new AppError("Team not found", 404);
  if (team.is_private) {
    throw new AppError("Cannot join private team directly — use an invite code", 400);
  }
  if (await teamsRepo.isMember(teamId, actorId)) {
    throw new AppError("User is already a member of this team", 400);
  }
  const member = await teamsRepo.addMember(teamId, actorId, "member");
  await notificationsService.notify(team.created_by, "team_join", {
    teamId,
    userId: actorId,
  });
  return member;
}

export async function getTeam(teamId, actorId) {
  const team = await teamsRepo.findTeamWithMembership(teamId, actorId);
  if (!team) throw new AppError("Team not found", 404);

  const isMember = Boolean(team.is_member);
  if (team.is_private && !isMember) {
    throw new AppError("This team is private — membership required", 403);
  }

  const members = await teamsRepo.listMembers(teamId);
  const myRole = await teamsRepo.getMemberRole(teamId, actorId);
  return {
    ...team,
    members,
    member_count: parseInt(team.member_count, 10) || 0,
    is_member: isMember,
    my_role: myRole,
  };
}

export async function updateTeam(actorId, teamId, payload) {
  const role = await teamsRepo.getMemberRole(teamId, actorId);
  if (!assertManager(role)) {
    throw new AppError("Only owners/admins can edit the team", 403);
  }
  const updated = await teamsRepo.updateTeam(teamId, payload);
  if (!updated) throw new AppError("Team not found", 404);
  return updated;
}

export async function removeMember(actorId, teamId, targetUserId) {
  const actorRole = await teamsRepo.getMemberRole(teamId, actorId);
  if (!assertManager(actorRole)) {
    throw new AppError("Only owners/admins can remove members", 403);
  }

  const targetRole = await teamsRepo.getMemberRole(teamId, targetUserId);
  if (!targetRole) throw new AppError("Member not found", 404);
  if (targetRole === "owner") {
    throw new AppError("Cannot remove the team owner", 400);
  }
  if (actorRole === "admin" && targetRole === "admin") {
    throw new AppError("Admins cannot remove other admins", 403);
  }

  return teamsRepo.removeMember(teamId, targetUserId);
}

export async function createInvite(actorId, teamId) {
  const role = await teamsRepo.getMemberRole(teamId, actorId);
  if (!assertManager(role)) {
    throw new AppError("Only owners/admins can create invites", 403);
  }
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return teamsRepo.createInvite(teamId, actorId, expiresAt);
}

export async function joinByInviteCode(actorId, code) {
  const invite = await teamsRepo.findInviteByCode(code);
  if (!invite) throw new AppError("Invalid invite code", 404);
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    throw new AppError("Invite code has expired", 400);
  }
  if (await teamsRepo.isMember(invite.team_id, actorId)) {
    throw new AppError("Already a member of this team", 400);
  }

  const member = await teamsRepo.addMember(invite.team_id, actorId, "member");
  await notificationsService.notify(invite.created_by, "team_invite_accepted", {
    teamId: invite.team_id,
    userId: actorId,
    code,
  });
  return { member, teamId: invite.team_id, teamName: invite.team_name };
}
