import * as eventsRepo from "../repositories/eventsRepository.js";
import * as usersRepo from "../repositories/usersRepository.js";
import * as notificationsService from "./notificationsService.js";
import { AppError } from "../utils/response.js";
import { normalizeTags, scoreEventForUser } from "../utils/matching.js";

function mapEvent(event) {
  return {
    ...event,
    registeredVolunteers: parseInt(event.registered_volunteers, 10) || 0,
    member_limit: event.member_limit || null,
    user_joined: event.user_joined || false,
    tags: event.tags || [],
  };
}

export async function createEvent(actorId, payload) {
  const memberLimit = parseInt(payload.member_limit, 10);
  const tags = normalizeTags(
    payload.tags?.length ? payload.tags : [payload.category]
  );

  const event = await eventsRepo.createEvent({
    ...payload,
    member_limit: memberLimit,
    created_by: actorId,
    tags,
  });

  const joinData = await eventsRepo.insertJoin(event.id, actorId, payload.date);
  return { event, joinData };
}

export async function listEvents(actorId) {
  const rows = await eventsRepo.listEvents(actorId);
  return rows.map(mapEvent);
}

export async function recommendedEvents(actorId) {
  const user = await usersRepo.findById(actorId);
  if (!user) throw new AppError("User not found", 404);

  const rows = await eventsRepo.listEvents(actorId);
  return rows
    .filter((event) => !event.user_joined)
    .map((event) => {
      const mapped = mapEvent(event);
      const { score, breakdown } = scoreEventForUser(user, mapped);
      return { ...mapped, matchScore: score, matchBreakdown: breakdown };
    })
    .filter((event) => event.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || String(a.date).localeCompare(String(b.date)));
}

export async function joinEvent(actorId, eventId, joinDate) {
  try {
    const result = await eventsRepo.joinEventTransactional(
      eventId,
      actorId,
      joinDate || new Date().toISOString().slice(0, 10)
    );

    if (result.organizerId && String(result.organizerId) !== String(actorId)) {
      await notificationsService.notify(result.organizerId, "event_join", {
        eventId,
        eventTitle: result.eventTitle,
        userId: actorId,
      });
    }

    await notificationsService.notify(actorId, "join_confirmed", {
      eventId,
      eventTitle: result.eventTitle,
    });

    return { joinData: result.joinData, event: result.event };
  } catch (error) {
    throw new AppError(error.message || "Failed to join event", error.statusCode || 400);
  }
}

export async function listRegistrants(actorId, eventId) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);
  if (String(event.created_by) !== String(actorId)) {
    throw new AppError("Only the organizer can view attendance", 403);
  }
  return {
    event,
    registrants: await eventsRepo.listRegistrants(eventId),
  };
}

export async function markAttendance(actorId, eventId, targetUserId, status) {
  const allowed = ["registered", "attended", "no_show"];
  if (!allowed.includes(status)) {
    throw new AppError("Invalid attendance status", 400);
  }

  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);
  if (String(event.created_by) !== String(actorId)) {
    throw new AppError("Only the organizer can mark attendance", 403);
  }

  const updated = await eventsRepo.updateAttendance(eventId, targetUserId, status);
  if (!updated) throw new AppError("Registration not found", 404);

  await notificationsService.notify(targetUserId, "attendance_marked", {
    eventId,
    eventTitle: event.title,
    status,
  });

  return updated;
}
