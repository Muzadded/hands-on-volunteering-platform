import { z } from "zod";
import { idParam } from "./auth.js";
import {
  HELP_POST_CATEGORIES,
  HELP_POST_STATUSES,
  HELP_POST_TYPES,
  HELP_POST_URGENCIES,
} from "../constants/helpPosts.js";

const optionalCoord = z.coerce.number().finite().optional().nullable();

export const createHelpPostSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      details: z.string().min(1),
      location: z.string().min(1),
      urgency_level: z.enum(HELP_POST_URGENCIES).or(z.string().min(1)),
      post_type: z.enum(HELP_POST_TYPES).optional().default("ask"),
      category: z.enum(HELP_POST_CATEGORIES).optional().default("other"),
      lat: optionalCoord,
      lng: optionalCoord,
    })
    .superRefine((body, ctx) => {
      const hasLat = body.lat != null;
      const hasLng = body.lng != null;
      if (hasLat !== hasLng) {
        ctx.addIssue({
          code: "custom",
          message: "Both lat and lng are required together",
          path: ["lat"],
        });
      }
      if (hasLat && (body.lat < -90 || body.lat > 90)) {
        ctx.addIssue({ code: "custom", message: "lat out of range", path: ["lat"] });
      }
      if (hasLng && (body.lng < -180 || body.lng > 180)) {
        ctx.addIssue({ code: "custom", message: "lng out of range", path: ["lng"] });
      }
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
  body: z
    .object({
      status: z.enum(HELP_POST_STATUSES).optional(),
      title: z.string().trim().min(1).max(200).optional(),
      details: z.string().min(1).optional(),
      location: z.string().min(1).optional(),
      urgency_level: z.enum(HELP_POST_URGENCIES).optional(),
      post_type: z.enum(HELP_POST_TYPES).optional(),
      category: z.enum(HELP_POST_CATEGORIES).optional(),
      lat: optionalCoord,
      lng: optionalCoord,
    })
    .refine(
      (body) =>
        Object.values(body).some((v) => v !== undefined && v !== null && v !== ""),
      { message: "At least one field is required" }
    ),
});

export const listHelpPostsSchema = z.object({
  query: z
    .object({
      status: z.enum(HELP_POST_STATUSES).optional(),
      urgency: z.string().optional(),
      post_type: z.enum(HELP_POST_TYPES).optional(),
      category: z.enum(HELP_POST_CATEGORIES).optional(),
      lat: z.coerce.number().finite().optional(),
      lng: z.coerce.number().finite().optional(),
      radius_km: z.coerce.number().positive().max(200).optional(),
    })
    .optional()
    .default({}),
});

export const nearbyHelpersSchema = z.object({
  params: idParam,
  query: z
    .object({
      radius_km: z.coerce.number().positive().max(50).optional(),
    })
    .optional()
    .default({}),
});

export const inviteHelpersSchema = z.object({
  params: idParam,
  body: z.object({
    user_ids: z.array(z.coerce.number().int().positive()).min(1).max(20),
  }),
});

export const listMyInvitesSchema = z.object({
  query: z
    .object({
      status: z.enum(["pending", "accepted", "declined", "cancelled"]).optional(),
    })
    .optional()
    .default({}),
});

export const respondInviteSchema = z.object({
  params: z.object({
    inviteId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["accepted", "declined"]),
    meeting_time: z.string().min(1).optional().nullable(),
  }),
});

export const addReviewSchema = z.object({
  params: idParam,
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional().nullable(),
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    target_type: z.enum(["help_post", "user"]),
    target_id: z.coerce.number().int().positive(),
    reason: z.string().trim().min(1).max(100),
    details: z.string().max(2000).optional().nullable(),
  }),
});

export const listReportsSchema = z.object({
  query: z
    .object({
      status: z.enum(["open", "resolved", "dismissed"]).optional(),
    })
    .optional()
    .default({}),
});

export const resolveReportSchema = z.object({
  params: z.object({
    reportId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["resolved", "dismissed"]),
    resolution_note: z.string().max(1000).optional().nullable(),
  }),
});
