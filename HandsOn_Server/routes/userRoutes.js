import express from "express";
import { getUserById } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

// User routes
router.get("/users/:id", getUserById);

export default router;
