import { z } from "zod";
import { idParam } from "./auth.ts";

export const createHelpPostSchema = z.object({
  body: z.object({
    details: z.string().min(1),
    location: z.string().min(1),
    urgency_level: z.enum(["urgent", "medium", "low", "default"]).or(z.string().min(1)),
  }),
});

export const getHelpPostSchema = z.object({
  params: idParam,
});

export const addCommentSchema = z.object({
  params: idParam,
  body: z.object({
    comment: z.string().min(1),
    userId: z.coerce.number().int().positive().optional(),
  }),
});

export const updateHelpPostSchema = z.object({
  params: idParam,
  body: z.object({
    status: z.enum(["open", "in_progress", "resolved"]),
  }),
});

export const listHelpPostsSchema = z.object({
  query: z
    .object({
      status: z.enum(["open", "in_progress", "resolved"]).optional(),
      urgency: z.string().optional(),
    })
    .optional()
    .default({}),
});
