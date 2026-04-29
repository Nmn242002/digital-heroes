type QueuedEmailNotification = {
  to: string;
  subject: string;
  body: string;
  queuedAt: string;
  provider: "mock";
};

const globalNotifications = globalThis as typeof globalThis & {
  __drawclubEmailNotifications?: QueuedEmailNotification[];
};

function notificationQueue() {
  globalNotifications.__drawclubEmailNotifications ??= [];
  return globalNotifications.__drawclubEmailNotifications;
}

export function queueEmailNotification(input: { to: string; subject: string; body: string }) {
  notificationQueue().push({ ...input, queuedAt: new Date().toISOString(), provider: "mock" });
}

export function queuedEmailNotifications() {
  return notificationQueue();
}
