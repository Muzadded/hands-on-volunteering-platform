import { Router } from "express";
import authorization from "../src/middleware/auth.js";
import { validate } from "../src/middleware/validate.js";
import * as usersController from "../src/controllers/usersController.js";
import * as eventsController from "../src/controllers/eventsController.js";
import * as helpPostsController from "../src/controllers/helpPostsController.js";
import * as teamsController from "../src/controllers/teamsController.js";
import { updateUserSchema, getUserSchema } from "../src/validators/users.ts";
import { createEventSchema } from "../src/validators/events.ts";
import { createHelpPostSchema } from "../src/validators/helpPosts.ts";
import { createTeamSchema } from "../src/validators/teams.ts";

const router = Router();

router.use(authorization);

router.get("/users/:id", validate(getUserSchema), usersController.getUserById);
router.put("/users/:id", validate(updateUserSchema), usersController.updateUser);

router.post("/create-event/:id", validate(createEventSchema), eventsController.createEvent);
router.get("/get-events", eventsController.listEvents);
router.post("/join-event", (req, res, next) => {
  req.params.id = req.body.event_id;
  return eventsController.joinEvent(req, res, next);
});

router.post(
  "/create-help-post/:id",
  validate(createHelpPostSchema),
  helpPostsController.createHelpPost
);
router.get("/get-help-posts", helpPostsController.listHelpPosts);
router.get("/help-post/:postId", (req, res, next) => {
  req.params.id = req.params.postId;
  return helpPostsController.getHelpPost(req, res, next);
});
router.post("/help-post/comment", (req, res, next) => {
  req.params.id = req.body.postId;
  return helpPostsController.addComment(req, res, next);
});

router.post("/create-team/:id", validate(createTeamSchema), teamsController.createTeam);
router.get("/get-teams", teamsController.listTeams);
router.post("/join-team/:teamId", (req, res, next) => {
  req.params.id = req.params.teamId;
  return teamsController.joinTeam(req, res, next);
});
router.get("/team/:teamId", (req, res, next) => {
  req.params.id = req.params.teamId;
  return teamsController.getTeam(req, res, next);
});

export default router;
