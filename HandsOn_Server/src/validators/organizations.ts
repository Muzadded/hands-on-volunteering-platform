import { z } from "zod";

const optionalUrl = z
  .union([z.string().url(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));

const optionalEmail = z
  .union([z.email(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    logo_url: optionalUrl,
    contact_email: optionalEmail,
    contact_phone: z.string().optional().nullable(),
    website: optionalUrl,
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    logo_url: optionalUrl,
    contact_email: optionalEmail,
    contact_phone: z.string().optional().nullable(),
    website: optionalUrl,
  }),
});

export const organizationIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const organizationKeySchema = z.object({
  params: z.object({
    idOrSlug: z.string().min(1),
  }),
});

export const verifyOrganizationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      verified: z.boolean().optional().default(true),
    })
    .optional()
    .default({ verified: true }),
});
