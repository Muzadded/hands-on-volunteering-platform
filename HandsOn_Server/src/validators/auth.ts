import { z } from "zod";

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    gender: z.string().min(1),
    dob: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    about: z.string().optional().nullable(),
    skills: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    causes: z.array(z.string()).optional().default([]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password: z.string().min(6),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20),
  }),
});
