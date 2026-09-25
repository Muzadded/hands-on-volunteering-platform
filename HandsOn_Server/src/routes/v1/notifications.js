import { Router } from "express";
import { z } from "zod";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as notificationsController from "../../controllers/notificationsController.js";

const router = Router();

router.get(
  "/stream",
  authorization,
  notificationsController.streamNotifications
);

router.use(authorization);

router.get("/", notificationsController.listNotifications);
router.post("/read", notificationsController.markRead);
router.patch(
  "/preferences",
  validate(
    z.object({
      body: z.object({
        phone: z.string().min(5).max(30).optional().nullable(),
        notify_in_app: z.boolean().optional(),
        notify_email: z.boolean().optional(),
        notify_sms: z.boolean().optional(),
      }),
    })
  ),
  notificationsController.updatePreferences
);

router.get("/templates", notificationsController.listTemplates);
router.post(
  "/templates",
  validate(
    z.object({
      body: z.object({
        name: z.string().min(1),
        body: z.string().min(1),
        subject: z.string().optional().nullable(),
        channel: z.enum(["in_app", "email", "sms", "all"]).optional(),
        organization_id: z.coerce.number().int().positive().optional().nullable(),
      }),
    })
  ),
  notificationsController.createTemplate
);

export default router;
