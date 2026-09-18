import { Router } from "express";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as eventsController from "../../controllers/eventsController.js";
import {
  createEventSchema,
  joinEventSchema,
  attendanceSchema,
} from "../../validators/events.ts";
import { idParam } from "../../validators/auth.ts";
import { z } from "zod";

const router = Router();

router.use(authorization);

router.get("/", eventsController.listEvents);
router.get("/recommended", eventsController.recommendedEvents);
router.post("/", validate(createEventSchema), eventsController.createEvent);
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

export default router;
