import * as eventsRepo from "../repositories/eventsRepository.js";
import * as usersRepo from "../repositories/usersRepository.js";
import * as notificationsService from "./notificationsService.js";
import * as organizationsService from "./organizationsService.js";
import * as credentialsRepo from "../repositories/credentialsRepository.js";
import { AppError } from "../utils/response.js";
import { normalizeTags, scoreEventForUser, hoursBetween } from "../utils/matching.js";
import { buildEventTimestamps } from "../utils/eventTime.js";

function mapEvent(event) {
  return {
    ...event,
    registeredVolunteers: parseInt(event.registered_volunteers, 10) || 0,
    member_limit: event.member_limit || null,
    user_joined: event.user_joined || false,
    tags: event.tags || [],
    required_credentials: event.required_credentials || [],
  };
}

function assertOrganizer(event, actorId) {
  if (!event) throw new AppError("Event not found", 404);
  if (String(event.created_by) !== String(actorId)) {
    throw new AppError("Only the organizer can manage this event", 403);
  }
}

function addDaysIsoDate(dateStr, days) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function buildCreatePayload(actorId, payload, extras = {}) {
  const memberLimit = parseInt(payload.member_limit, 10);
  const tags = normalizeTags(
    payload.tags?.length ? payload.tags : [payload.category]
  );
  const { startsAt, endsAt } = buildEventTimestamps(
    payload.date,
    payload.start_time,
    payload.end_time
  );
  if (!startsAt || !endsAt) {
    throw new AppError("Invalid event date/time", 400);
  }

  const organizationId = payload.organization_id
    ? Number(payload.organization_id)
    : null;
  if (organizationId) {
    await organizationsService.assertCanManageOrgEvents(actorId, organizationId);
  }

  return {
    ...payload,
    member_limit: memberLimit,
    created_by: actorId,
    tags,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    organization_id: organizationId,
    waiver_text: payload.waiver_text || null,
    min_age: payload.min_age ?? null,
    required_credentials: normalizeTags(payload.required_credentials || []),
    ...extras,
  };
}

export async function createEvent(actorId, payload) {
  const base = await buildCreatePayload(actorId, payload);
  const event = await eventsRepo.createEvent(base);

  const created = [event];
  const rule = payload.recurrence_rule;
  const count = Math.min(Number(payload.recurrence_count) || 0, 12);
  if (rule === "weekly" && count > 1) {
    for (let i = 1; i < count; i += 1) {
      const nextDate = addDaysIsoDate(payload.date, 7 * i);
      const childPayload = await buildCreatePayload(actorId, {
        ...payload,
        date: nextDate,
      }, {
        recurrence_parent_id: event.id,
        recurrence_rule: "weekly",
      });
      created.push(await eventsRepo.createEvent(childPayload));
    }
  }

  if (Array.isArray(payload.shifts) && payload.shifts.length) {
    for (const shift of payload.shifts) {
      const starts = shift.starts_at
        || buildEventTimestamps(payload.date, shift.start_time || payload.start_time, shift.end_time || payload.end_time).startsAt?.toISOString();
      const ends = shift.ends_at
        || buildEventTimestamps(payload.date, shift.start_time || payload.start_time, shift.end_time || payload.end_time).endsAt?.toISOString();
      await eventsRepo.createShift({
        event_id: event.id,
        role_name: shift.role_name,
        starts_at: starts,
        ends_at: ends,
        capacity: Number(shift.capacity),
      });
    }
  }

  await Promise.all(created.map((ev) => notificationsService.scheduleEventReminders(ev)));

  return { event, series: created.length > 1 ? created : undefined };
}

export async function getEvent(eventId, actorId = null) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);
  const shifts = await eventsRepo.listShifts(eventId);
  const mapped = mapEvent(event);
  const isOrganizer = actorId && String(event.created_by) === String(actorId);
  return {
    ...mapped,
    shifts: shifts.map((s) => ({
      ...s,
      seats_remaining: Math.max(0, s.capacity - (s.filled || 0)),
    })),
    checkin_token: isOrganizer ? event.checkin_token : undefined,
  };
}

export async function getEventByShareSlug(slug) {
  const event = await eventsRepo.findByShareSlug(slug);
  if (!event || event.status === "cancelled") {
    throw new AppError("Event not found", 404);
  }
  const shifts = await eventsRepo.listShifts(event.id);
  return {
    ...mapEvent(event),
    shifts,
    checkin_token: undefined,
  };
}

export async function updateEvent(actorId, eventId, payload) {
  const existing = await eventsRepo.findById(eventId);
  assertOrganizer(existing, actorId);
  if (existing.status === "cancelled") {
    throw new AppError("Cannot edit a cancelled event", 400);
  }

  let starts_at = null;
  let ends_at = null;
  if (payload.date || payload.start_time || payload.end_time) {
    const { startsAt, endsAt } = buildEventTimestamps(
      payload.date || existing.date,
      payload.start_time || existing.start_time,
      payload.end_time || existing.end_time
    );
    if (!startsAt || !endsAt) throw new AppError("Invalid event date/time", 400);
    starts_at = startsAt.toISOString();
    ends_at = endsAt.toISOString();
  }

  const updated = await eventsRepo.updateEvent(eventId, {
    ...payload,
    tags: payload.tags ? normalizeTags(payload.tags) : undefined,
    required_credentials: payload.required_credentials
      ? normalizeTags(payload.required_credentials)
      : undefined,
    starts_at,
    ends_at,
  });
  if (!updated) throw new AppError("Event not found", 404);

  const registrants = await eventsRepo.listActiveRegistrantUserIds(eventId);
  await Promise.all(
    registrants.map((uid) =>
      notificationsService.notify(uid, "event_updated", {
        eventId,
        eventTitle: updated.title,
      })
    )
  );

  await notificationsService.scheduleEventReminders(updated);

  return updated;
}

export async function cancelEvent(actorId, eventId, reason) {
  const existing = await eventsRepo.findById(eventId);
  assertOrganizer(existing, actorId);
  const cancelled = await eventsRepo.cancelEvent(eventId, reason);
  if (!cancelled) throw new AppError("Event not found or already cancelled", 404);

  await notificationsService.cancelEventReminderJobs(eventId);

  const registrants = await eventsRepo.listActiveRegistrantUserIds(eventId);
  await Promise.all(
    registrants.map((uid) =>
      notificationsService.notify(uid, "event_cancelled", {
        eventId,
        eventTitle: cancelled.title,
        reason: reason || null,
      })
    )
  );

  return cancelled;
}

export async function listEvents(actorId, filters = {}) {
  const result = await eventsRepo.listEvents(actorId, {
    upcoming: filters.upcoming !== false && filters.upcoming !== "false",
    available: filters.available === true || filters.available === "true",
    page: filters.page,
    limit: filters.limit,
  });
  return {
    ...result,
    items: result.items.map(mapEvent),
  };
}

export async function recommendedEvents(actorId) {
  const user = await usersRepo.findById(actorId);
  if (!user) throw new AppError("User not found", 404);

  const { items } = await eventsRepo.listEvents(actorId, {
    upcoming: true,
    available: true,
    page: 1,
    limit: 100,
  });

  return items
    .filter((event) => !event.user_joined)
    .map((event) => {
      const mapped = mapEvent(event);
      const { score, breakdown } = scoreEventForUser(user, mapped);
      return { ...mapped, matchScore: score, matchBreakdown: breakdown };
    })
    .filter((event) => event.matchScore > 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        String(a.date).localeCompare(String(b.date))
    );
}

export async function joinEvent(actorId, eventId, body = {}) {
  try {
    const event = await eventsRepo.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);
    if (String(event.created_by) === String(actorId)) {
      throw new AppError("Organizers cannot join their own event as volunteers", 400);
    }
    if (event.status === "cancelled") {
      throw new AppError("Event has been cancelled", 400);
    }

    if (event.min_age) {
      const user = await usersRepo.findById(actorId);
      if (user?.dob) {
        const age = Math.floor(
          (Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 3600 * 1000)
        );
        if (age < event.min_age) {
          throw new AppError(`Volunteers must be at least ${event.min_age}`, 400);
        }
      }
    }

    const required = event.required_credentials || [];
    if (required.length) {
      const ok = await credentialsRepo.hasTypes(actorId, required);
      if (!ok) {
        throw new AppError(
          `Missing required credentials: ${required.join(", ")}`,
          400
        );
      }
    }

    if (event.waiver_text && !body.waiver_signature) {
      throw new AppError("Waiver signature is required for this event", 400);
    }

    const result = await eventsRepo.joinEventTransactional(
      eventId,
      actorId,
      body.join_date || new Date().toISOString().slice(0, 10),
      {
        guestCount: Math.max(0, Number(body.guest_count) || 0),
        shiftId: body.shift_id ? Number(body.shift_id) : null,
        allowWaitlist: !body.shift_id,
      }
    );

    if (event.waiver_text && body.waiver_signature) {
      await eventsRepo.signWaiver(eventId, actorId, String(body.waiver_signature));
    }

    if (result.organizerId && String(result.organizerId) !== String(actorId)) {
      await notificationsService.notify(result.organizerId, "event_join", {
        eventId,
        eventTitle: result.eventTitle,
        userId: actorId,
        waitlisted: result.waitlisted,
      });
    }

    await notificationsService.notify(actorId, result.waitlisted ? "waitlisted" : "join_confirmed", {
      eventId,
      eventTitle: result.eventTitle,
    });

    return {
      joinData: result.joinData,
      event: result.event,
      waitlisted: result.waitlisted,
    };
  } catch (error) {
    throw new AppError(error.message || "Failed to join event", error.statusCode || 400);
  }
}

export async function withdrawFromEvent(actorId, eventId) {
  try {
    const result = await eventsRepo.withdrawTransactional(eventId, actorId);
    if (result.promoted) {
      await notificationsService.notify(result.promoted.user_id, "waitlist_promoted", {
        eventId,
        eventTitle: result.eventTitle,
      });
      if (result.organizerId) {
        await notificationsService.notify(result.organizerId, "waitlist_promoted", {
          eventId,
          eventTitle: result.eventTitle,
          userId: result.promoted.user_id,
        });
      }
    }
    return result;
  } catch (error) {
    throw new AppError(error.message || "Failed to withdraw", error.statusCode || 400);
  }
}

export async function listRegistrants(actorId, eventId) {
  const event = await eventsRepo.findById(eventId);
  assertOrganizer(event, actorId);
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
  assertOrganizer(event, actorId);
  if (String(event.created_by) === String(targetUserId)) {
    throw new AppError("Organizers cannot mark their own attendance", 400);
  }

  const updated = await eventsRepo.updateAttendance(eventId, targetUserId, status);
  if (!updated) throw new AppError("Registration not found", 404);

  await notificationsService.notify(targetUserId, "attendance_marked", {
    eventId,
    eventTitle: event.title,
    status,
  });

  if (status === "attended") {
    await notificationsService.enqueueThankYou(eventId, targetUserId);
  }

  return updated;
}

export async function addShift(actorId, eventId, payload) {
  const event = await eventsRepo.findById(eventId);
  assertOrganizer(event, actorId);
  const { startsAt, endsAt } = buildEventTimestamps(
    payload.date || event.date,
    payload.start_time || event.start_time,
    payload.end_time || event.end_time
  );
  return eventsRepo.createShift({
    event_id: eventId,
    role_name: payload.role_name,
    starts_at: payload.starts_at || startsAt?.toISOString(),
    ends_at: payload.ends_at || endsAt?.toISOString(),
    capacity: Number(payload.capacity),
  });
}

export async function listShifts(eventId) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);
  return eventsRepo.listShifts(eventId);
}

export async function checkIn(actorId, eventId, { token, user_id: targetUserId } = {}) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);

  const isOrganizer = String(event.created_by) === String(actorId);
  if (token) {
    if (token !== event.checkin_token) {
      throw new AppError("Invalid check-in token", 400);
    }
  } else if (!isOrganizer) {
    throw new AppError("Organizer or valid check-in token required", 403);
  }

  const volunteerId = targetUserId || actorId;
  if (isOrganizer && !targetUserId && token !== event.checkin_token) {
    // organizer without target must not check themselves in as volunteer hours
    throw new AppError("Provide user_id to check in a volunteer", 400);
  }
  if (String(event.created_by) === String(volunteerId)) {
    throw new AppError("Organizers cannot check themselves in as volunteers", 400);
  }

  const updated = await eventsRepo.setCheckInOut(eventId, volunteerId, { checkIn: true });
  if (!updated) throw new AppError("Active registration not found", 404);
  if (updated.status === "attended") {
    await notificationsService.enqueueThankYou(eventId, volunteerId);
  }
  return updated;
}

export async function checkOut(actorId, eventId, { token, user_id: targetUserId } = {}) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);

  const isOrganizer = String(event.created_by) === String(actorId);
  if (token) {
    if (token !== event.checkin_token) {
      throw new AppError("Invalid check-in token", 400);
    }
  } else if (!isOrganizer && String(actorId) !== String(targetUserId || actorId)) {
    throw new AppError("Not authorized", 403);
  }

  const volunteerId = targetUserId || actorId;
  const updated = await eventsRepo.setCheckInOut(eventId, volunteerId, { checkOut: true });
  if (!updated) throw new AppError("Check-in required before check-out", 400);
  return updated;
}

export function buildIcs(event) {
  const dt = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  };
  const start = dt(event.starts_at) || `${String(event.date).replace(/-/g, "")}T090000Z`;
  const end = dt(event.ends_at) || start;
  const uid = `event-${event.id}@handson.local`;
  const desc = String(event.details || "").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HandsOn//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${String(event.title || "HandsOn Event").replace(/,/g, "\\,")}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${String(event.location || "").replace(/,/g, "\\,")}`,
    `URL:${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/events/share/${event.share_slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function hoursForAttendance(row) {
  if (row.check_in_at && row.check_out_at) {
    return hoursBetween(row.check_in_at, row.check_out_at);
  }
  if (row.starts_at && row.ends_at) {
    return hoursBetween(row.starts_at, row.ends_at);
  }
  return hoursBetween(row.start_time, row.end_time);
}
