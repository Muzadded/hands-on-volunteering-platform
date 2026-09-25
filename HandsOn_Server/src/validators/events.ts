import { z } from "zod";
import { idParam } from "./auth.js";

const shiftInput = z.object({
  role_name: z.string().min(1),
  capacity: z.coerce.number().int().positive(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  date: z.string().optional(),
});

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
    organization_id: z.coerce.number().int().positive().optional().nullable(),
    recurrence_rule: z.enum(["weekly"]).optional().nullable(),
    recurrence_count: z.coerce.number().int().min(1).max(12).optional(),
    waiver_text: z.string().optional().nullable(),
    min_age: z.coerce.number().int().positive().optional().nullable(),
    required_credentials: z.array(z.string()).optional(),
    shifts: z.array(shiftInput).optional(),
  }),
});

export const updateEventSchema = z.object({
  params: idParam,
  body: z.object({
    title: z.string().min(1).optional(),
    details: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    start_time: z.string().min(1).optional(),
    end_time: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    member_limit: z.coerce.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    waiver_text: z.string().optional().nullable(),
    min_age: z.coerce.number().int().positive().optional().nullable(),
    required_credentials: z.array(z.string()).optional(),
  }),
});

export const cancelEventSchema = z.object({
  params: idParam,
  body: z
    .object({
      reason: z.string().optional().nullable(),
    })
    .optional()
    .default({}),
});

export const joinEventSchema = z.object({
  params: idParam,
  body: z
    .object({
      join_date: z.string().optional(),
      user_id: z.coerce.number().int().positive().optional(),
      guest_count: z.coerce.number().int().min(0).max(20).optional(),
      shift_id: z.coerce.number().int().positive().optional().nullable(),
      waiver_signature: z.string().min(1).optional(),
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

export const shiftSchema = z.object({
  params: idParam,
  body: shiftInput,
});

export const checkInSchema = z.object({
  params: idParam,
  body: z
    .object({
      token: z.string().optional(),
      user_id: z.coerce.number().int().positive().optional(),
    })
    .optional()
    .default({}),
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
