import { Router } from "express";
import authRoutes from "./auth.js";
import usersRoutes from "./users.js";
import organizationsRoutes from "./organizations.js";
import eventsRoutes from "./events.js";
import helpPostsRoutes from "./helpPosts.js";
import teamsRoutes from "./teams.js";
import healthRoutes from "./health.js";
import notificationsRoutes from "./notifications.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/organizations", organizationsRoutes);
router.use("/events", eventsRoutes);
router.use("/help-posts", helpPostsRoutes);
router.use("/teams", teamsRoutes);
router.use("/notifications", notificationsRoutes);

export default router;
