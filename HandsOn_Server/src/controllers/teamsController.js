import * as teamsService from "../services/teamsService.js";
import { sendSuccess } from "../utils/response.js";

export async function createTeam(req, res, next) {
  try {
    const created = await teamsService.createTeam(req.user, req.body);
    return sendSuccess(res, 201, "Team created successfully", created);
  } catch (error) {
    next(error);
  }
}

export async function listTeams(req, res, next) {
  try {
    const teams = await teamsService.listTeams(req.user);
    return sendSuccess(res, 200, "Teams fetched successfully", teams);
  } catch (error) {
    next(error);
  }
}

export async function joinTeam(req, res, next) {
  try {
    const result = await teamsService.joinTeam(req.user, req.params.id);
    return sendSuccess(res, 200, "Team joined successfully", result);
  } catch (error) {
    next(error);
  }
}

export async function getTeam(req, res, next) {
  try {
    const team = await teamsService.getTeam(req.params.id, req.user);
    return sendSuccess(res, 200, "Team details fetched successfully", team);
  } catch (error) {
    next(error);
  }
}

export async function updateTeam(req, res, next) {
  try {
    const team = await teamsService.updateTeam(req.user, req.params.id, req.body);
    return sendSuccess(res, 200, "Team updated", team);
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    const removed = await teamsService.removeMember(
      req.user,
      req.params.id,
      req.params.userId
    );
    return sendSuccess(res, 200, "Member removed", removed);
  } catch (error) {
    next(error);
  }
}

export async function createInvite(req, res, next) {
  try {
    const invite = await teamsService.createInvite(req.user, req.params.id);
    return sendSuccess(res, 201, "Invite created", invite);
  } catch (error) {
    next(error);
  }
}

export async function joinByCode(req, res, next) {
  try {
    const result = await teamsService.joinByInviteCode(req.user, req.body.code);
    return sendSuccess(res, 200, "Joined team via invite", result);
  } catch (error) {
    next(error);
  }
}
