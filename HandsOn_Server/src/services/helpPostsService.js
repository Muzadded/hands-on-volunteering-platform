import * as helpRepo from "../repositories/helpPostsRepository.js";
import * as usersRepo from "../repositories/usersRepository.js";
import * as notificationsService from "./notificationsService.js";
import { AppError } from "../utils/response.js";
import { presentHelpPost } from "../utils/geo.js";
import {
  HELP_POST_CATEGORIES,
  HELP_POST_STATUSES,
  HELP_POST_TYPES,
} from "../constants/helpPosts.js";

function hasContentPatch(payload = {}) {
  return [
    "title",
    "details",
    "location",
    "urgency_level",
    "post_type",
    "category",
    "lat",
    "lng",
  ].some((key) => payload[key] !== undefined && payload[key] !== null);
}

function parseOptionalCoord(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) throw new AppError("Invalid coordinates", 400);
  if (n < -90 || n > 90) {
    // caller distinguishes lat vs lng; validate loosely here and tighten in validators
  }
  return n;
}

export async function createHelpPost(actorId, payload) {
  const postType = payload.post_type || "ask";
  const category = payload.category || "other";

  if (!HELP_POST_TYPES.includes(postType)) {
    throw new AppError("Invalid post type", 400);
  }
  if (!HELP_POST_CATEGORIES.includes(category)) {
    throw new AppError("Invalid category", 400);
  }

  const title =
    (payload.title && String(payload.title).trim()) ||
    String(payload.details || "").trim().slice(0, 120) ||
    "Help request";

  const lat = parseOptionalCoord(payload.lat);
  const lng = parseOptionalCoord(payload.lng);
  if ((lat == null) !== (lng == null)) {
    throw new AppError("Both lat and lng are required together", 400);
  }
  if (lat != null && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) {
    throw new AppError("Coordinates out of range", 400);
  }

  const created = await helpRepo.createHelpPost({
    created_by: actorId,
    title,
    details: payload.details,
    location: payload.location,
    urgency_level: payload.urgency_level,
    post_type: postType,
    category,
    lat,
    lng,
  });
  return presentHelpPost(created, actorId);
}

export async function listHelpPosts(actorId, filters = {}) {
  const posts = await helpRepo.listHelpPosts(filters);
  return posts.map((p) => presentHelpPost(p, actorId));
}

export async function getHelpPost(actorId, postId) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  const comments = await helpRepo.listComments(postId);
  const reviews = await helpRepo.listReviewsForPost(postId);
  return { post: presentHelpPost(post, actorId), comments, reviews };
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

  // Claimer may now see exact address
  const full = await helpRepo.findHelpPostById(postId);
  return presentHelpPost(full, actorId);
}

export async function updateHelpPost(actorId, postId, payload) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);

  const isOwner = String(post.created_by) === String(actorId);
  const isHelper = post.claimed_by && String(post.claimed_by) === String(actorId);
  if (!isOwner && !isHelper) {
    throw new AppError("Not authorized to update this help post", 403);
  }

  const contentEdit = hasContentPatch(payload);
  if (contentEdit && !isOwner) {
    throw new AppError("Only the author can edit post content", 403);
  }

  if (payload.status && !HELP_POST_STATUSES.includes(payload.status)) {
    throw new AppError("Invalid status", 400);
  }
  if (payload.post_type && !HELP_POST_TYPES.includes(payload.post_type)) {
    throw new AppError("Invalid post type", 400);
  }
  if (payload.category && !HELP_POST_CATEGORIES.includes(payload.category)) {
    throw new AppError("Invalid category", 400);
  }

  if (payload.status === "open" && !isOwner) {
    throw new AppError("Only the requester can reopen a help post", 403);
  }

  if (!payload.status && !contentEdit) {
    throw new AppError("No updates provided", 400);
  }

  let lat = payload.lat !== undefined ? parseOptionalCoord(payload.lat) : undefined;
  let lng = payload.lng !== undefined ? parseOptionalCoord(payload.lng) : undefined;
  if (lat !== undefined || lng !== undefined) {
    const nextLat = lat !== undefined ? lat : post.lat;
    const nextLng = lng !== undefined ? lng : post.lng;
    if ((nextLat == null) !== (nextLng == null)) {
      throw new AppError("Both lat and lng are required together", 400);
    }
  }

  const updated = await helpRepo.updateHelpPost(postId, {
    status: payload.status,
    clearClaim: payload.status === "open",
    title: payload.title,
    details: payload.details,
    location: payload.location,
    urgency_level: payload.urgency_level,
    post_type: payload.post_type,
    category: payload.category,
    lat,
    lng,
  });
  return presentHelpPost(updated, actorId);
}

export async function deleteHelpPost(actorId, postId) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);

  const isOwner = String(post.created_by) === String(actorId);
  if (!isOwner) {
    const actor = await usersRepo.findById(actorId);
    if (!actor || actor.platform_role !== "admin") {
      throw new AppError("Not authorized to delete this help post", 403);
    }
  }

  const deleted = await helpRepo.deleteHelpPost(postId);
  if (!deleted) throw new AppError("Help post not found", 404);
  return deleted;
}

const CATEGORY_SKILL_HINTS = {
  groceries: ["shopping", "errands", "delivery"],
  medicine: ["first aid", "medical", "pharmacy", "health"],
  elderly_checkin: ["elderly", "care", "companionship"],
  ride: ["driving", "transport", "ride"],
  tutoring: ["teaching", "tutoring", "education"],
  evacuation: ["rescue", "disaster", "emergency"],
  other: [],
};

function scoreHelperForPost(user, post) {
  const hints = CATEGORY_SKILL_HINTS[post.category] || [];
  const skills = (user.skills || []).map((s) => String(s).toLowerCase());
  const causes = (user.causes || []).map((s) => String(s).toLowerCase());
  const hay = [...skills, ...causes].join(" ");
  let score = 0;
  for (const hint of hints) {
    if (hay.includes(hint)) score += 2;
  }
  if (post.category && hay.includes(post.category.replace("_", " "))) score += 1;
  // Prefer closer helpers
  const dist = Number(user.distance_km) || 0;
  score += Math.max(0, 5 - dist);
  return score;
}

export async function listNearbyHelpers(actorId, postId, { radius_km = 10 } = {}) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  if (String(post.created_by) !== String(actorId)) {
    throw new AppError("Only the author can invite helpers", 403);
  }
  if (post.status !== "open") {
    throw new AppError("Can only invite for open posts", 400);
  }
  if (post.lat == null || post.lng == null) {
    throw new AppError("Post needs coordinates before inviting nearby helpers", 400);
  }

  const nearby = await helpRepo.findNearbyUsers({
    lat: post.lat,
    lng: post.lng,
    radius_km: Number(radius_km) || 10,
    excludeUserId: actorId,
    limit: 30,
  });

  return nearby
    .map((u) => ({
      user_id: u.user_id,
      name: u.name,
      skills: u.skills || [],
      causes: u.causes || [],
      distance_km: Number(Number(u.distance_km).toFixed(2)),
      match_score: scoreHelperForPost(u, post),
    }))
    .sort((a, b) => b.match_score - a.match_score || a.distance_km - b.distance_km);
}

export async function inviteHelpers(actorId, postId, userIds = []) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  if (String(post.created_by) !== String(actorId)) {
    throw new AppError("Only the author can invite helpers", 403);
  }
  if (post.status !== "open") {
    throw new AppError("Can only invite for open posts", 400);
  }

  const ids = [...new Set((userIds || []).map(Number).filter((n) => n && n !== Number(actorId)))];
  if (!ids.length) throw new AppError("No helpers selected", 400);

  const invites = [];
  for (const uid of ids) {
    const invite = await helpRepo.createInvite({
      help_post_id: postId,
      invited_user_id: uid,
      invited_by: actorId,
    });
    invites.push(invite);
    await notificationsService.notify(uid, "help_invite", {
      postId,
      inviteId: invite.id,
      fromUserId: actorId,
      title: post.title,
    });
  }
  return invites;
}

export async function listMyInvites(actorId, filters = {}) {
  return helpRepo.listInvitesForUser(actorId, filters);
}

export async function listPostInvites(actorId, postId) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  if (String(post.created_by) !== String(actorId)) {
    throw new AppError("Only the author can view invites", 403);
  }
  return helpRepo.listInvitesForPost(postId);
}

export async function respondToInvite(actorId, inviteId, payload) {
  const invite = await helpRepo.findInviteById(inviteId);
  if (!invite) throw new AppError("Invite not found", 404);
  if (String(invite.invited_user_id) !== String(actorId)) {
    throw new AppError("Not authorized to respond to this invite", 403);
  }
  if (invite.status !== "pending") {
    throw new AppError("Invite is no longer pending", 400);
  }

  const status = payload.status;
  if (!["accepted", "declined"].includes(status)) {
    throw new AppError("Invalid response", 400);
  }

  if (status === "declined") {
    return helpRepo.respondToInvite(inviteId, { status: "declined" });
  }

  // Accept: claim post if still open, share contact + optional meeting time
  if (invite.post_status !== "open" || invite.claimed_by) {
    throw new AppError("Help post is no longer available", 400);
  }

  const claimed = await helpRepo.claimHelpPost(invite.help_post_id, actorId);
  if (!claimed) throw new AppError("Help post is no longer available", 400);

  const owner = await usersRepo.findById(invite.post_owner_id);
  const helper = await usersRepo.findById(actorId);
  const meeting_time = payload.meeting_time || null;

  const shared_contact = {
    requester: {
      user_id: owner?.user_id,
      name: owner?.name,
      phone: owner?.phone || null,
    },
    helper: {
      user_id: helper?.user_id,
      name: helper?.name,
      phone: helper?.phone || null,
    },
    meeting_time,
    location: invite.location,
    lat: invite.post_lat,
    lng: invite.post_lng,
  };

  const updated = await helpRepo.respondToInvite(inviteId, {
    status: "accepted",
    shared_contact,
    meeting_time,
  });

  await notificationsService.notify(invite.post_owner_id, "help_invite_accepted", {
    postId: invite.help_post_id,
    inviteId,
    helperId: actorId,
    meeting_time,
  });

  return {
    invite: updated,
    post: presentHelpPost(await helpRepo.findHelpPostById(invite.help_post_id), actorId),
    shared_contact,
  };
}

export async function addReview(actorId, postId, { rating, comment }) {
  const post = await helpRepo.findHelpPostById(postId);
  if (!post) throw new AppError("Help post not found", 404);
  if (post.status !== "resolved") {
    throw new AppError("Reviews are only allowed after the post is resolved", 400);
  }
  if (!post.claimed_by) {
    throw new AppError("No helper to review", 400);
  }

  const isOwner = String(post.created_by) === String(actorId);
  const isHelper = String(post.claimed_by) === String(actorId);
  if (!isOwner && !isHelper) {
    throw new AppError("Only participants can leave a review", 403);
  }

  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new AppError("Rating must be 1-5", 400);
  }

  const reviewee_id = isOwner ? post.claimed_by : post.created_by;
  const review = await helpRepo.createReview({
    help_post_id: postId,
    reviewer_id: actorId,
    reviewee_id,
    rating: score,
    comment,
  });

  await notificationsService.notify(reviewee_id, "help_review", {
    postId,
    reviewId: review.id,
    rating: score,
    fromUserId: actorId,
  });

  return review;
}

export async function reportTarget(actorId, payload) {
  const targetType = payload.target_type;
  const targetId = Number(payload.target_id);
  if (!["help_post", "user"].includes(targetType)) {
    throw new AppError("Invalid report target", 400);
  }
  if (!payload.reason || !String(payload.reason).trim()) {
    throw new AppError("Reason is required", 400);
  }

  if (targetType === "help_post") {
    const post = await helpRepo.findHelpPostById(targetId);
    if (!post) throw new AppError("Help post not found", 404);
  } else {
    const user = await usersRepo.findById(targetId);
    if (!user) throw new AppError("User not found", 404);
    if (String(targetId) === String(actorId)) {
      throw new AppError("You cannot report yourself", 400);
    }
  }

  return helpRepo.createReport({
    reporter_id: actorId,
    target_type: targetType,
    target_id: targetId,
    reason: String(payload.reason).trim().slice(0, 100),
    details: payload.details || null,
  });
}

async function assertPlatformAdmin(actorId) {
  const actor = await usersRepo.findById(actorId);
  if (!actor || actor.platform_role !== "admin") {
    throw new AppError("Admin access required", 403);
  }
  return actor;
}

export async function listReports(actorId, filters = {}) {
  await assertPlatformAdmin(actorId);
  return helpRepo.listReports(filters);
}

export async function resolveReport(actorId, reportId, payload) {
  await assertPlatformAdmin(actorId);
  const report = await helpRepo.findReportById(reportId);
  if (!report) throw new AppError("Report not found", 404);
  const status = payload.status;
  if (!["resolved", "dismissed"].includes(status)) {
    throw new AppError("Invalid resolution status", 400);
  }
  return helpRepo.resolveReport(reportId, {
    status,
    resolved_by: actorId,
    resolution_note: payload.resolution_note,
  });
}
