import { Router } from "express";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as eventsController from "../../controllers/eventsController.js";
import * as notificationsController from "../../controllers/notificationsController.js";
import {
  createEventSchema,
  joinEventSchema,
  attendanceSchema,
  listEventsSchema,
  updateEventSchema,
  cancelEventSchema,
  shiftSchema,
  checkInSchema,
} from "../../validators/events.ts";
import { idParam } from "../../validators/auth.js";
import { z } from "zod";

const router = Router();

// Public share / calendar endpoints (no auth)
router.get("/share/:slug", eventsController.getSharedEvent);
router.get("/share/:slug/ics", eventsController.downloadSharedIcs);

router.use(authorization);

router.get("/", validate(listEventsSchema), eventsController.listEvents);
router.get("/recommended", eventsController.recommendedEvents);
router.post("/", validate(createEventSchema), eventsController.createEvent);

router.get(
  "/:id",
  validate(z.object({ params: idParam })),
  eventsController.getEvent
);
router.patch("/:id", validate(updateEventSchema), eventsController.updateEvent);
router.post("/:id/cancel", validate(cancelEventSchema), eventsController.cancelEvent);
router.get(
  "/:id/ics",
  validate(z.object({ params: idParam })),
  eventsController.downloadIcs
);

router.get(
  "/:id/registrants",
  validate(z.object({ params: idParam })),
  eventsController.listRegistrants
);
router.post(
  "/:id/attendance",
  validate(attendanceSchema),
  eventsController.markAttendance
);
router.post("/:id/join", validate(joinEventSchema), eventsController.joinEvent);
router.post(
  "/:id/withdraw",
  validate(z.object({ params: idParam })),
  eventsController.withdraw
);

router.get(
  "/:id/shifts",
  validate(z.object({ params: idParam })),
  eventsController.listShifts
);
router.post("/:id/shifts", validate(shiftSchema), eventsController.addShift);

router.post("/:id/check-in", validate(checkInSchema), eventsController.checkIn);
router.post("/:id/check-out", validate(checkInSchema), eventsController.checkOut);
router.post(
  "/:id/messages",
  validate(
    z.object({
      params: idParam,
      body: z.object({
        subject: z.string().optional(),
        body: z.string().optional(),
        template_id: z.coerce.number().int().positive().optional(),
        channel: z.enum(["in_app", "email", "sms", "all"]).optional(),
      }),
    })
  ),
  notificationsController.sendBulk
);

export default router;
