import * as eventsService from "../services/eventsService.js";
import { sendSuccess } from "../utils/response.js";

export async function createEvent(req, res, next) {
  try {
    const created = await eventsService.createEvent(req.user, req.body);
    return sendSuccess(res, 201, "Event created successfully", created);
  } catch (error) {
    next(error);
  }
}

export async function listEvents(req, res, next) {
  try {
    const events = await eventsService.listEvents(req.user);
    return sendSuccess(res, 200, "Events fetched successfully", events);
  } catch (error) {
    next(error);
  }
}

export async function recommendedEvents(req, res, next) {
  try {
    const events = await eventsService.recommendedEvents(req.user);
    return sendSuccess(res, 200, "Recommended events fetched successfully", events);
  } catch (error) {
    next(error);
  }
}

export async function joinEvent(req, res, next) {
  try {
    const result = await eventsService.joinEvent(
      req.user,
      req.params.id,
      req.body?.join_date
    );
    return sendSuccess(res, 200, "Event joined successfully", result);
  } catch (error) {
    next(error);
  }
}

export async function listRegistrants(req, res, next) {
  try {
    const data = await eventsService.listRegistrants(req.user, req.params.id);
    return sendSuccess(res, 200, "Registrants fetched successfully", data);
  } catch (error) {
    next(error);
  }
}

export async function markAttendance(req, res, next) {
  try {
    const updated = await eventsService.markAttendance(
      req.user,
      req.params.id,
      req.body.user_id,
      req.body.status
    );
    return sendSuccess(res, 200, "Attendance updated", updated);
  } catch (error) {
    next(error);
  }
}
