import * as organizationsService from "../services/organizationsService.js";
import { sendSuccess } from "../utils/response.js";

export async function createOrganization(req, res, next) {
  try {
    const org = await organizationsService.createOrganization(req.user, req.body);
    return sendSuccess(res, 201, "Organization created", org);
  } catch (error) {
    next(error);
  }
}

export async function listOrganizations(req, res, next) {
  try {
    const verifiedOnly =
      req.query.verified === "true" || req.query.verified === true;
    const orgs = await organizationsService.listOrganizations({ verifiedOnly });
    return sendSuccess(res, 200, "Organizations fetched", orgs);
  } catch (error) {
    next(error);
  }
}

export async function listMyOrganizations(req, res, next) {
  try {
    const orgs = await organizationsService.listMyOrganizations(req.user);
    return sendSuccess(res, 200, "My organizations fetched", orgs);
  } catch (error) {
    next(error);
  }
}

export async function getOrganization(req, res, next) {
  try {
    const org = await organizationsService.getPublicOrganization(
      req.params.idOrSlug
    );
    return sendSuccess(res, 200, "Organization fetched", org);
  } catch (error) {
    next(error);
  }
}

export async function updateOrganization(req, res, next) {
  try {
    const org = await organizationsService.updateOrganization(
      req.user,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, "Organization updated", org);
  } catch (error) {
    next(error);
  }
}

export async function verifyOrganization(req, res, next) {
  try {
    const org = await organizationsService.verifyOrganization(
      req.user,
      req.params.id,
      req.body?.verified !== false
    );
    return sendSuccess(res, 200, "Organization verification updated", org);
  } catch (error) {
    next(error);
  }
}
