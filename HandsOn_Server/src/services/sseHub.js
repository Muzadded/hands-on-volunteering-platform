/** In-memory SSE fan-out for authenticated notification streams. */
const clients = new Map();

export function addClient(userId, res) {
  const key = String(userId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
}

export function removeClient(userId, res) {
  const key = String(userId);
  const set = clients.get(key);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(key);
}

export function publishToUser(userId, eventName, data) {
  const set = clients.get(String(userId));
  if (!set || set.size === 0) return 0;
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  let sent = 0;
  for (const res of set) {
    try {
      res.write(payload);
      sent += 1;
    } catch {
      set.delete(res);
    }
  }
  return sent;
}

export function clientCount(userId) {
  return clients.get(String(userId))?.size || 0;
}
