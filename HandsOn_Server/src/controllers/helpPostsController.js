import * as helpPostsService from "../services/helpPostsService.js";
import { sendSuccess } from "../utils/response.js";

export async function createHelpPost(req, res, next) {
  try {
    const post = await helpPostsService.createHelpPost(req.user, req.body);
    return sendSuccess(res, 201, "Help post created successfully", post);
  } catch (error) {
    next(error);
  }
}

export async function listHelpPosts(req, res, next) {
  try {
    const posts = await helpPostsService.listHelpPosts(req.user, {
      status: req.query.status,
      urgency: req.query.urgency,
      post_type: req.query.post_type,
      category: req.query.category,
      lat: req.query.lat,
      lng: req.query.lng,
      radius_km: req.query.radius_km,
    });
    return sendSuccess(res, 200, "Help posts fetched successfully", posts);
  } catch (error) {
    next(error);
  }
}

export async function getHelpPost(req, res, next) {
  try {
    const data = await helpPostsService.getHelpPost(req.user, req.params.id);
    return sendSuccess(res, 200, "Help post details fetched successfully", data);
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const comment = await helpPostsService.addComment(
      req.user,
      req.params.id,
      req.body.comment
    );
    return sendSuccess(res, 201, "Comment added successfully", comment);
  } catch (error) {
    next(error);
  }
}

export async function claimHelpPost(req, res, next) {
  try {
    const post = await helpPostsService.claimHelpPost(req.user, req.params.id);
    return sendSuccess(res, 200, "Help post claimed", post);
  } catch (error) {
    next(error);
  }
}

export async function updateHelpPost(req, res, next) {
  try {
    const post = await helpPostsService.updateHelpPost(
      req.user,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, "Help post updated", post);
  } catch (error) {
    next(error);
  }
}

export async function deleteHelpPost(req, res, next) {
  try {
    await helpPostsService.deleteHelpPost(req.user, req.params.id);
    return sendSuccess(res, 200, "Help post deleted");
  } catch (error) {
    next(error);
  }
}

export async function listNearbyHelpers(req, res, next) {
  try {
    const helpers = await helpPostsService.listNearbyHelpers(
      req.user,
      req.params.id,
      { radius_km: req.query.radius_km }
    );
    return sendSuccess(res, 200, "Nearby helpers fetched", helpers);
  } catch (error) {
    next(error);
  }
}

export async function inviteHelpers(req, res, next) {
  try {
    const invites = await helpPostsService.inviteHelpers(
      req.user,
      req.params.id,
      req.body.user_ids
    );
    return sendSuccess(res, 201, "Invites sent", invites);
  } catch (error) {
    next(error);
  }
}

export async function listPostInvites(req, res, next) {
  try {
    const invites = await helpPostsService.listPostInvites(req.user, req.params.id);
    return sendSuccess(res, 200, "Invites fetched", invites);
  } catch (error) {
    next(error);
  }
}

export async function listMyInvites(req, res, next) {
  try {
    const invites = await helpPostsService.listMyInvites(req.user, {
      status: req.query.status,
    });
    return sendSuccess(res, 200, "My invites fetched", invites);
  } catch (error) {
    next(error);
  }
}

export async function respondToInvite(req, res, next) {
  try {
    const data = await helpPostsService.respondToInvite(
      req.user,
      req.params.inviteId,
      req.body
    );
    return sendSuccess(res, 200, "Invite updated", data);
  } catch (error) {
    next(error);
  }
}

export async function addReview(req, res, next) {
  try {
    const review = await helpPostsService.addReview(req.user, req.params.id, req.body);
    return sendSuccess(res, 201, "Review submitted", review);
  } catch (error) {
    next(error);
  }
}

export async function createReport(req, res, next) {
  try {
    const report = await helpPostsService.reportTarget(req.user, req.body);
    return sendSuccess(res, 201, "Report submitted", report);
  } catch (error) {
    next(error);
  }
}

export async function listReports(req, res, next) {
  try {
    const reports = await helpPostsService.listReports(req.user, {
      status: req.query.status,
    });
    return sendSuccess(res, 200, "Reports fetched", reports);
  } catch (error) {
    next(error);
  }
}

export async function resolveReport(req, res, next) {
  try {
    const report = await helpPostsService.resolveReport(
      req.user,
      req.params.reportId,
      req.body
    );
    return sendSuccess(res, 200, "Report updated", report);
  } catch (error) {
    next(error);
  }
}
