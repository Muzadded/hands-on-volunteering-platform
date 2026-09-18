import { z } from "zod";
import { idParam } from "./auth.ts";

export const getUserSchema = z.object({
  params: idParam,
});

export const updateUserSchema = z.object({
  params: idParam,
  body: z.object({
    name: z.string().min(1),
    gender: z.string().min(1),
    dob: z.string().min(1),
    about: z.string().optional().nullable(),
    skills: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    causes: z.union([z.array(z.string()), z.string()]).optional().default([]),
  }),
});
