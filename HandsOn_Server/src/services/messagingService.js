import * as usersRepo from "../repositories/usersRepository.js";
import * as messagingRepo from "../repositories/messagingRepository.js";
import { sendMail } from "../utils/mailer.js";
import { sendSms } from "../utils/sms.js";
import { AppError } from "../utils/response.js";

const EMAIL_SUBJECTS = {
  join_confirmed: "You're confirmed for {{eventTitle}}",
  waitlisted: "You're on the waitlist for {{eventTitle}}",
  waitlist_promoted: "A spot opened for {{eventTitle}}",
  event_cancelled: "{{eventTitle}} was cancelled",
  event_updated: "{{eventTitle}} was updated",
  event_join: "Someone joined {{eventTitle}}",
  attendance_marked: "Attendance marked for {{eventTitle}}",
  event_reminder: "Reminder: {{eventTitle}} starts soon",
  thank_you: "Thank you for volunteering at {{eventTitle}}",
  bulk_message: "{{subject}}",
};

function defaultBody(type, payload = {}) {
  switch (type) {
    case "join_confirmed":
      return `You're confirmed for ${payload.eventTitle || "an event"}.`;
    case "waitlisted":
      return `You're on the waitlist for ${payload.eventTitle || "an event"}.`;
    case "waitlist_promoted":
      return `Good news — a spot opened for ${payload.eventTitle || "an event"}.`;
    case "event_cancelled":
      return `${payload.eventTitle || "An event"} was cancelled.${
        payload.reason ? ` Reason: ${payload.reason}` : ""
      }`;
    case "event_updated":
      return `${payload.eventTitle || "An event"} details were updated. Please review the latest info.`;
    case "event_join":
      return `A volunteer joined ${payload.eventTitle || "your event"}.`;
    case "attendance_marked":
      return `Your attendance for ${payload.eventTitle || "an event"} was marked as ${payload.status || "updated"}.`;
    case "event_reminder":
      return `Reminder: ${payload.eventTitle || "your event"} starts in ${payload.window || "soon"} (${payload.startsAt || ""}).`;
    case "thank_you":
      return `Thank you for volunteering at ${payload.eventTitle || "the event"}! Your impact hours have been recorded.`;
    case "bulk_message":
      return payload.body || "";
    default:
      return payload.body || type.replaceAll("_", " ");
  }
}

export async function deliverToUser(userId, type, payload = {}, channels) {
  const user = await usersRepo.findById(userId);
  if (!user) return { skipped: true };

  const vars = {
    name: user.name,
    eventTitle: payload.eventTitle || "",
    status: payload.status || "",
    reason: payload.reason || "",
    window: payload.window || "",
    startsAt: payload.startsAt || "",
    subject: payload.subject || "",
    body: payload.body || "",
  };

  const subjectTemplate = EMAIL_SUBJECTS[type] || "HandsOn notification";
  const subject = messagingRepo.renderTemplate(subjectTemplate, vars);
  const body = payload.body
    ? messagingRepo.renderTemplate(payload.body, vars)
    : defaultBody(type, payload);

  const want = channels || {
    in_app: user.notify_in_app !== false,
    email: user.notify_email !== false,
    sms: Boolean(user.notify_sms),
  };

  const results = {};

  if (want.email && user.email) {
    results.email = await sendMail({ to: user.email, subject, text: body });
    await messagingRepo.logMessage({
      user_id: userId,
      channel: "email",
      subject,
      body,
      status: "sent",
      meta: { type },
    });
  }

  if (want.sms && user.phone) {
    results.sms = await sendSms({ to: user.phone, text: `${subject}: ${body}`.slice(0, 320) });
    await messagingRepo.logMessage({
      user_id: userId,
      channel: "sms",
      subject,
      body,
      status: results.sms?.skipped ? "skipped" : "sent",
      meta: { type },
    });
  }

  return { userId, subject, body, results };
}

export async function createTemplate(actorId, payload) {
  return messagingRepo.createTemplate({
    ...payload,
    created_by: actorId,
  });
}

export async function listTemplates(actorId, organizationId) {
  return messagingRepo.listTemplates({ userId: actorId, organizationId });
}

export async function getTemplate(id) {
  const template = await messagingRepo.findTemplate(id);
  if (!template) throw new AppError("Template not found", 404);
  return template;
}
