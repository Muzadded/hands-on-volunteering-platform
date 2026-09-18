import { Router } from "express";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as teamsController from "../../controllers/teamsController.js";
import {
  createTeamSchema,
  teamIdSchema,
  joinTeamSchema,
  updateTeamSchema,
  removeMemberSchema,
  joinByCodeSchema,
} from "../../validators/teams.ts";

const router = Router();

router.use(authorization);

router.get("/", teamsController.listTeams);
router.post("/", validate(createTeamSchema), teamsController.createTeam);
router.post("/join-by-code", validate(joinByCodeSchema), teamsController.joinByCode);
router.get("/:id", validate(teamIdSchema), teamsController.getTeam);
router.patch("/:id", validate(updateTeamSchema), teamsController.updateTeam);
router.post("/:id/join", validate(joinTeamSchema), teamsController.joinTeam);
router.post("/:id/invites", validate(teamIdSchema), teamsController.createInvite);
router.delete(
  "/:id/members/:userId",
  validate(removeMemberSchema),
  teamsController.removeMember
);

export default router;
