import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET is required"),
  CLIENT_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  SMS_API_URL: z.string().optional().default(""),
  SMS_API_KEY: z.string().optional().default(""),
  SMS_SENDER_ID: z.string().optional().default("HandsOn"),
  JOB_WORKER_INTERVAL_MS: z.coerce.number().int().positive().default(2000),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || process.env.jwtSecret,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  SMS_API_URL: process.env.SMS_API_URL,
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID,
  JOB_WORKER_INTERVAL_MS: process.env.JOB_WORKER_INTERVAL_MS,
});
