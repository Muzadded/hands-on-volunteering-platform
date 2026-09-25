import * as notificationsService from "../services/notificationsService.js";
import * as messagingService from "../services/messagingService.js";
import { sendSuccess } from "../utils/response.js";
import { addClient, removeClient } from "../services/sseHub.js";

export async function listNotifications(req, res, next) {
  try {
    const data = await notificationsService.list(req.user);
    return sendSuccess(res, 200, "Notifications fetched", data);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const data = await notificationsService.markRead(req.user, req.body?.ids || []);
    return sendSuccess(res, 200, "Notifications marked read", data);
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const user = await notificationsService.updatePreferences(req.user, req.body || {});
    return sendSuccess(res, 200, "Notification preferences updated", user);
  } catch (error) {
    next(error);
  }
}

export async function streamNotifications(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.user })}\n\n`);
  addClient(req.user, res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(req.user, res);
  });
}

export async function createTemplate(req, res, next) {
  try {
    const template = await messagingService.createTemplate(req.user, req.body);
    return sendSuccess(res, 201, "Template created", template);
  } catch (error) {
    next(error);
  }
}

export async function listTemplates(req, res, next) {
  try {
    const templates = await messagingService.listTemplates(
      req.user,
      req.query.organization_id ? Number(req.query.organization_id) : undefined
    );
    return sendSuccess(res, 200, "Templates fetched", templates);
  } catch (error) {
    next(error);
  }
}

export async function sendBulk(req, res, next) {
  try {
    const result = await notificationsService.sendBulkMessage(
      req.user,
      req.params.id,
      req.body || {}
    );
    return sendSuccess(res, 202, "Bulk message queued", result);
  } catch (error) {
    next(error);
  }
}
