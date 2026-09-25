import { z } from "zod";
import { idParam } from "./auth.js";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    category: z.string().min(1),
    isPrivate: z.boolean().optional().default(false),
    created_by: z.coerce.number().int().positive().optional(),
  }),
});

export const teamIdSchema = z.object({
  params: idParam,
});

export const joinTeamSchema = z.object({
  params: idParam,
  body: z
    .object({
      userId: z.coerce.number().int().positive().optional(),
    })
    .optional()
    .default({}),
});

export const updateTeamSchema = z.object({
  params: idParam,
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    category: z.string().min(1).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    userId: z.coerce.number().int().positive(),
  }),
});

export const joinByCodeSchema = z.object({
  body: z.object({
    code: z.string().min(4),
  }),
});
