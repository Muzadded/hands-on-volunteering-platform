import * as helpRepo from "../repositories/helpPostsRepository.js";
import * as notificationsService from "./notificationsService.js";
import { AppError } from "../utils/response.js";

export async function createHelpPost(actorId, payload) {
  return helpRepo.createHelpPost({
    created_by: actorId,
    details: payload.details,
    location: payload.location,
    urgency_level: payload.urgency_level,
  });
}

export async function listHelpPosts(filters = {}) {
  return helpRepo.listHelpPosts(filters);
}

export async function getHelpPost(postId) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  const comments = await helpRepo.listComments(postId);
  return { post, comments };
}

export async function addComment(actorId, postId, comment) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);

  const created = await helpRepo.addComment(postId, actorId, comment);

  if (String(post.created_by) !== String(actorId)) {
    await notificationsService.notify(post.created_by, "help_comment", {
      postId,
      commentId: created.comment_id,
      fromUserId: actorId,
    });
  }

  return created;
}

export async function claimHelpPost(actorId, postId) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  if (String(post.created_by) === String(actorId)) {
    throw new AppError("You cannot claim your own help post", 400);
  }
  if (post.status !== "open" || post.claimed_by) {
    throw new AppError("Help post is not available to claim", 400);
  }

  const claimed = await helpRepo.claimHelpPost(postId, actorId);
  if (!claimed) throw new AppError("Help post is not available to claim", 400);

  await notificationsService.notify(post.created_by, "help_claimed", {
    postId,
    helperId: actorId,
  });

  return claimed;
}

export async function updateHelpPost(actorId, postId, payload) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);

  const isOwner = String(post.created_by) === String(actorId);
  const isHelper = post.claimed_by && String(post.claimed_by) === String(actorId);
  if (!isOwner && !isHelper) {
    throw new AppError("Not authorized to update this help post", 403);
  }

  if (payload.status && !["open", "in_progress", "resolved"].includes(payload.status)) {
    throw new AppError("Invalid status", 400);
  }

  // Only owner can reopen; helper/owner can mark resolved/in_progress
  if (payload.status === "open" && !isOwner) {
    throw new AppError("Only the requester can reopen a help post", 403);
  }

  return helpRepo.updateHelpPost(postId, {
    status: payload.status,
    clearClaim: payload.status === "open",
  });
}
