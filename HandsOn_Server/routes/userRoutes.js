import express from "express";
import {
  getUserById,
  updateUser,
  createEvent,
  getAllEvents,
  joinEvent,
  createHelpPost,
  getAllHelpPosts,
  getHelpPostById,
  addCommentToHelpPost,
  createTeam,
  getAllTeams,
  joinTeam,
  getTeamById,
} from "../controllers/userController.js";

const router = express.Router();

// User routes
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.post("/create-event/:id", createEvent);
router.get("/get-events", getAllEvents);
router.post("/create-help-post/:id", createHelpPost);
router.post("/join-event", joinEvent);
router.get("/get-help-posts", getAllHelpPosts);
router.get("/help-post/:postId", getHelpPostById);
router.post("/help-post/comment", addCommentToHelpPost);
router.post("/create-team/:id", createTeam);
router.get("/get-teams", getAllTeams);
router.post("/join-team/:teamId", joinTeam);
router.get("/team/:teamId", getTeamById);


// router.get("/test", test);

export default router;
