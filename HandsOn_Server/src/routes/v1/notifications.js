import { Router } from "express";
import authorization from "../../middleware/auth.js";
import * as notificationsController from "../../controllers/notificationsController.js";

const router = Router();

router.use(authorization);
router.get("/", notificationsController.listNotifications);
router.post("/read", notificationsController.markRead);

export default router;
