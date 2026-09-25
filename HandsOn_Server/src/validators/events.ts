import { z } from "zod";
import { idParam } from "./auth.js";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    details: z.string().min(1),
    date: z.string().min(1),
    location: z.string().min(1),
    start_time: z.string().min(1),
    end_time: z.string().min(1),
    category: z.string().min(1),
    member_limit: z.coerce.number().int().positive(),
    tags: z.array(z.string()).optional(),
  }),
});

export const joinEventSchema = z.object({
  params: idParam,
  body: z
    .object({
      join_date: z.string().optional(),
      user_id: z.coerce.number().int().positive().optional(),
    })
    .optional()
    .default({}),
});

export const attendanceSchema = z.object({
  params: idParam,
  body: z.object({
    user_id: z.coerce.number().int().positive(),
    status: z.enum(["registered", "attended", "no_show"]),
  }),
});

const listEventsQuerySchema = z.object({
  upcoming: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .default("true"),
  available: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .default("false"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export const listEventsSchema = z.object({
  query: listEventsQuerySchema.default({
    upcoming: "true",
    available: "false",
    page: 1,
    limit: 50,
  }),
});
