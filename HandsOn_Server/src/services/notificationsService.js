import * as notificationsRepo from "../repositories/notificationsRepository.js";
import * as usersRepo from "../repositories/usersRepository.js";
import * as eventsRepo from "../repositories/eventsRepository.js";
import * as messagingService from "./messagingService.js";
import * as messagingRepo from "../repositories/messagingRepository.js";
import { enqueueJob, cancelJobsByPrefix, registerJobHandler } from "./jobsService.js";
import { publishToUser } from "./sseHub.js";
import { AppError } from "../utils/response.js";

export async function notify(userId, type, payload = {}, { syncChannels = false } = {}) {
  if (!userId) return null;

  const user = await usersRepo.findById(userId);
  let row = null;
  if (!user || user.notify_in_app !== false) {
    row = await notificationsRepo.create({ userId, type, payload });
    publishToUser(userId, "notification", {
      item: row,
      type,
      payload,
    });
  }

  const job = await enqueueJob("deliver_channels", { userId, type, payload });

  if (syncChannels) {
    await messagingService.deliverToUser(userId, type, payload);
  }

  return { notification: row, job };
}

export async function list(userId) {
  const [items, unreadCount] = await Promise.all([
    notificationsRepo.listForUser(userId),
    notificationsRepo.countUnread(userId),
  ]);
  return { items, unreadCount };
}

export async function markRead(userId, ids) {
  await notificationsRepo.markRead(userId, ids);
  return list(userId);
}

export async function updatePreferences(userId, prefs) {
  const updated = await usersRepo.updateNotificationPrefs(userId, prefs);
  if (!updated) throw new AppError("User not found", 404);
  return updated;
}

export async function scheduleEventReminders(event) {
  if (!event?.id || !event.starts_at) return [];
  const starts = new Date(event.starts_at).getTime();
  if (Number.isNaN(starts)) return [];

  await cancelJobsByPrefix(`reminder:${event.id}:`);

  const jobs = [];
  const windows = [
    { key: "24h", ms: 24 * 60 * 60 * 1000 },
    { key: "2h", ms: 2 * 60 * 60 * 1000 },
  ];

  for (const w of windows) {
    const runAt = new Date(starts - w.ms);
    if (runAt.getTime() <= Date.now()) continue;
    jobs.push(
      await enqueueJob(
        "event_reminder",
        { eventId: event.id, window: w.key },
        { runAt, dedupeKey: `reminder:${event.id}:${w.key}` }
      )
    );
  }
  return jobs;
}

export async function cancelEventReminderJobs(eventId) {
  return cancelJobsByPrefix(`reminder:${eventId}:`);
}

export async function enqueueThankYou(eventId, userId) {
  return enqueueJob(
    "thank_you",
    { eventId, userId },
    { dedupeKey: `thanks:${eventId}:${userId}`, runAt: new Date(Date.now() + 5_000) }
  );
}

export async function sendBulkMessage(actorId, eventId, payload) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);
  if (String(event.created_by) !== String(actorId)) {
    throw new AppError("Only the organizer can message registrants", 403);
  }

  let subject = payload.subject || `Update about ${event.title}`;
  let body = payload.body || "";
  let templateId = payload.template_id || null;
  let channel = payload.channel || "all";

  if (templateId) {
    const template = await messagingRepo.findTemplate(templateId);
    if (!template) throw new AppError("Template not found", 404);
    subject = template.subject || subject;
    body = template.body;
    channel = template.channel === "all" ? channel : template.channel;
  }

  if (!body.trim()) throw new AppError("Message body is required", 400);

  const registrants = await eventsRepo.listActiveRegistrantUserIds(eventId);
  const job = await enqueueJob("bulk_message", {
    eventId,
    actorId,
    userIds: registrants,
    subject,
    body,
    channel,
    templateId,
    eventTitle: event.title,
  });

  return { queued: registrants.length, jobId: job.id };
}

async function handleDeliverChannels(payload) {
  await messagingService.deliverToUser(payload.userId, payload.type, payload.payload || {});
}

async function handleEventReminder(payload) {
  const event = await eventsRepo.findById(payload.eventId);
  if (!event || event.status === "cancelled") return;
  const userIds = await eventsRepo.listActiveRegistrantUserIds(event.id);
  for (const userId of userIds) {
    await notify(userId, "event_reminder", {
      eventId: event.id,
      eventTitle: event.title,
      window: payload.window,
      startsAt: event.starts_at,
    });
  }
}

async function handleThankYou(payload) {
  const event = await eventsRepo.findById(payload.eventId);
  if (!event) return;
  await notify(payload.userId, "thank_you", {
    eventId: event.id,
    eventTitle: event.title,
  });
}

async function handleBulkMessage(payload) {
  const channel = payload.channel || "all";
  for (const userId of payload.userIds || []) {
    const user = await usersRepo.findById(userId);
    if (!user) continue;

    if (channel === "in_app" || channel === "all") {
      const row = await notificationsRepo.create({
        userId,
        type: "bulk_message",
        payload: {
          eventId: payload.eventId,
          eventTitle: payload.eventTitle,
          subject: payload.subject,
          body: payload.body,
        },
      });
      publishToUser(userId, "notification", { item: row });
    }

    await messagingService.deliverToUser(
      userId,
      "bulk_message",
      {
        eventTitle: payload.eventTitle,
        subject: payload.subject,
        body: payload.body,
      },
      {
        email:
          (channel === "email" || channel === "all") && user.notify_email !== false,
        sms: (channel === "sms" || channel === "all") && Boolean(user.notify_sms),
        in_app: false,
      }
    );
  }
}

export function registerNotificationJobHandlers() {
  registerJobHandler("deliver_channels", handleDeliverChannels);
  registerJobHandler("event_reminder", handleEventReminder);
  registerJobHandler("thank_you", handleThankYou);
  registerJobHandler("bulk_message", handleBulkMessage);
}
