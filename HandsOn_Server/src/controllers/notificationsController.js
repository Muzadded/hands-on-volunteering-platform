import * as notificationsService from "../services/notificationsService.js";
import { sendSuccess } from "../utils/response.js";

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
    const data = await notificationsService.markRead(req.user, req.body.ids || []);
    return sendSuccess(res, 200, "Notifications marked read", data);
  } catch (error) {
    next(error);
  }
}
