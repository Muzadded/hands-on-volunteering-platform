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
    const events = await eventsService.listEvents(req.user, req.query);
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

export async function getEvent(req, res, next) {
  try {
    const event = await eventsService.getEvent(req.params.id, req.user);
    return sendSuccess(res, 200, "Event fetched", event);
  } catch (error) {
    next(error);
  }
}

export async function getSharedEvent(req, res, next) {
  try {
    const event = await eventsService.getEventByShareSlug(req.params.slug);
    return sendSuccess(res, 200, "Event fetched", event);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await eventsService.updateEvent(req.user, req.params.id, req.body);
    return sendSuccess(res, 200, "Event updated", event);
  } catch (error) {
    next(error);
  }
}

export async function cancelEvent(req, res, next) {
  try {
    const event = await eventsService.cancelEvent(
      req.user,
      req.params.id,
      req.body?.reason
    );
    return sendSuccess(res, 200, "Event cancelled", event);
  } catch (error) {
    next(error);
  }
}

export async function joinEvent(req, res, next) {
  try {
    const result = await eventsService.joinEvent(
      req.user,
      req.params.id,
      req.body || {}
    );
    const message = result.waitlisted
      ? "Added to waitlist"
      : "Event joined successfully";
    return sendSuccess(res, 200, message, result);
  } catch (error) {
    next(error);
  }
}

export async function withdraw(req, res, next) {
  try {
    const result = await eventsService.withdrawFromEvent(req.user, req.params.id);
    return sendSuccess(res, 200, "Withdrawn from event", result);
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

export async function addShift(req, res, next) {
  try {
    const shift = await eventsService.addShift(req.user, req.params.id, req.body);
    return sendSuccess(res, 201, "Shift created", shift);
  } catch (error) {
    next(error);
  }
}

export async function listShifts(req, res, next) {
  try {
    const shifts = await eventsService.listShifts(req.params.id);
    return sendSuccess(res, 200, "Shifts fetched", shifts);
  } catch (error) {
    next(error);
  }
}

export async function checkIn(req, res, next) {
  try {
    const row = await eventsService.checkIn(req.user, req.params.id, req.body || {});
    return sendSuccess(res, 200, "Checked in", row);
  } catch (error) {
    next(error);
  }
}

export async function checkOut(req, res, next) {
  try {
    const row = await eventsService.checkOut(req.user, req.params.id, req.body || {});
    return sendSuccess(res, 200, "Checked out", row);
  } catch (error) {
    next(error);
  }
}

export async function downloadIcs(req, res, next) {
  try {
    const event = await eventsService.getEvent(req.params.id, req.user);
    const ics = eventsService.buildIcs(event);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="handson-event-${event.id}.ics"`
    );
    return res.status(200).send(ics);
  } catch (error) {
    next(error);
  }
}

export async function downloadSharedIcs(req, res, next) {
  try {
    const event = await eventsService.getEventByShareSlug(req.params.slug);
    const ics = eventsService.buildIcs(event);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="handson-event-${event.id}.ics"`
    );
    return res.status(200).send(ics);
  } catch (error) {
    next(error);
  }
}
