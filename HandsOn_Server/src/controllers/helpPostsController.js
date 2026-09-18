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
    const posts = await helpPostsService.listHelpPosts({
      status: req.query.status,
      urgency: req.query.urgency,
    });
    return sendSuccess(res, 200, "Help posts fetched successfully", posts);
  } catch (error) {
    next(error);
  }
}

export async function getHelpPost(req, res, next) {
  try {
    const data = await helpPostsService.getHelpPost(req.params.id);
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
