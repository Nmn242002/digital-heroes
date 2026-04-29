import fs from "node:fs";
import path from "node:path";

const logDir = path.join(process.cwd(), "data");
const logFile = path.join(logDir, "email-notifications.json");

export function queueEmailNotification(input: { to: string; subject: string; body: string }) {
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const existing = fs.existsSync(logFile) ? (JSON.parse(fs.readFileSync(logFile, "utf8")) as unknown[]) : [];
  existing.push({ ...input, queuedAt: new Date().toISOString(), provider: "local-demo" });
  fs.writeFileSync(logFile, JSON.stringify(existing, null, 2));
}
