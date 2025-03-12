import express from "express";
import { getUserById, updateUser, createEvent} from "../controllers/userController.js";

const router = express.Router();

// User routes
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.post("/create-event/:id", createEvent);
// router.get("/test", test);

export default router;
