import logger from "../utils/logger.js";
import { env } from "../config/env.ts";

/**
 * Dev-safe mailer: logs messages unless SMTP is configured later.
 * Keeps recovery flows testable without an external provider.
 */
export async function sendMail({ to, subject, text }) {
  if (env.NODE_ENV === "test") {
    return { queued: true, to, subject };
  }

  logger.info(
    {
      to,
      subject,
      text,
      mailMode: "console",
    },
    "Outbound email (console transport — configure SMTP later for production)"
  );

  return { queued: true, to, subject };
}
