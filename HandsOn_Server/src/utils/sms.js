import logger from "../utils/logger.js";
import { env } from "../config/env.ts";

/**
 * Pluggable SMS sender for Bangladeshi gateways (SSL Wireless, Twilio, etc.).
 * Without SMS_API_URL it logs to console so local/dev stays safe.
 */
export async function sendSms({ to, text }) {
  if (!to) return { queued: false, skipped: true, reason: "missing_phone" };

  if (env.NODE_ENV === "test") {
    return { queued: true, to, text };
  }

  if (!env.SMS_API_URL) {
    logger.info(
      { to, text, smsMode: "console" },
      "Outbound SMS (console transport — set SMS_API_URL for production)"
    );
    return { queued: true, to, text, mode: "console" };
  }

  const response = await fetch(env.SMS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.SMS_API_KEY ? { Authorization: `Bearer ${env.SMS_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      to,
      message: text,
      from: env.SMS_SENDER_ID || "HandsOn",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SMS gateway error ${response.status}: ${body.slice(0, 300)}`);
  }

  return { queued: true, to, mode: "gateway" };
}
