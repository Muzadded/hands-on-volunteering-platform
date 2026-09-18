import * as notificationsRepo from "../repositories/notificationsRepository.js";

export async function notify(userId, type, payload = {}) {
  if (!userId) return null;
  return notificationsRepo.create({ userId, type, payload });
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
