import * as usersService from "../services/usersService.js";
import { sendSuccess } from "../utils/response.js";

export async function getMe(req, res, next) {
  try {
    const user = await usersService.getMe(req.user);
    return sendSuccess(res, 200, "Current user fetched successfully", user);
  } catch (error) {
    next(error);
  }
}

export async function getImpact(req, res, next) {
  try {
    const impact = await usersService.getImpact(req.user);
    return sendSuccess(res, 200, "Impact metrics fetched", impact);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const userData = await usersService.getUserProfile(req.user, req.params.id);
    return sendSuccess(res, 200, "User fetched successfully", userData);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const updated = await usersService.updateOwnProfile(
      req.user,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, "User updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

export async function listCredentials(req, res, next) {
  try {
    const items = await usersService.listCredentials(req.user);
    return sendSuccess(res, 200, "Credentials fetched", items);
  } catch (error) {
    next(error);
  }
}

export async function addCredential(req, res, next) {
  try {
    const item = await usersService.addCredential(req.user, req.body);
    return sendSuccess(res, 201, "Credential added", item);
  } catch (error) {
    next(error);
  }
}

export async function removeCredential(req, res, next) {
  try {
    const item = await usersService.removeCredential(req.user, req.params.credentialId);
    return sendSuccess(res, 200, "Credential removed", item);
  } catch (error) {
    next(error);
  }
}
