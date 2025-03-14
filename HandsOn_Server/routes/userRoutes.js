import express from "express";
import { getUserById, updateUser, createEvent, createHelpPost, getAllHelpPosts, getAllEvents, joinEvent, checkUserJoinedEvent } from "../controllers/userController.js";

const router = express.Router();

// User routes
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.post("/create-event/:id", createEvent);
router.get("/get-events", getAllEvents);
router.post("/create-help-post/:id", createHelpPost);
router.get("/get-help-posts", getAllHelpPosts);
router.post("/join-event", joinEvent);
router.get("/check-user-joined", checkUserJoinedEvent);

// router.get("/test", test);

export default router;


