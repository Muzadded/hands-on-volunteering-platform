import { Router } from "express";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as helpPostsController from "../../controllers/helpPostsController.js";
import {
  createHelpPostSchema,
  getHelpPostSchema,
  addCommentSchema,
  updateHelpPostSchema,
  listHelpPostsSchema,
  inviteHelpersSchema,
  respondInviteSchema,
  listMyInvitesSchema,
  nearbyHelpersSchema,
  addReviewSchema,
  createReportSchema,
  listReportsSchema,
  resolveReportSchema,
} from "../../validators/helpPosts.ts";

const router = Router();

router.use(authorization);

router.get("/", validate(listHelpPostsSchema), helpPostsController.listHelpPosts);
router.post("/", validate(createHelpPostSchema), helpPostsController.createHelpPost);
router.get(
  "/invites/mine",
  validate(listMyInvitesSchema),
  helpPostsController.listMyInvites
);
router.post(
  "/invites/:inviteId/respond",
  validate(respondInviteSchema),
  helpPostsController.respondToInvite
);
router.get(
  "/moderation/reports",
  validate(listReportsSchema),
  helpPostsController.listReports
);
router.patch(
  "/moderation/reports/:reportId",
  validate(resolveReportSchema),
  helpPostsController.resolveReport
);
router.post("/reports", validate(createReportSchema), helpPostsController.createReport);
router.get("/:id", validate(getHelpPostSchema), helpPostsController.getHelpPost);
router.post(
  "/:id/comments",
  validate(addCommentSchema),
  helpPostsController.addComment
);
router.post("/:id/claim", validate(getHelpPostSchema), helpPostsController.claimHelpPost);
router.post("/:id/reviews", validate(addReviewSchema), helpPostsController.addReview);
router.get(
  "/:id/nearby-helpers",
  validate(nearbyHelpersSchema),
  helpPostsController.listNearbyHelpers
);
router.get(
  "/:id/invites",
  validate(getHelpPostSchema),
  helpPostsController.listPostInvites
);
router.post(
  "/:id/invites",
  validate(inviteHelpersSchema),
  helpPostsController.inviteHelpers
);
router.patch(
  "/:id",
  validate(updateHelpPostSchema),
  helpPostsController.updateHelpPost
);
router.delete(
  "/:id",
  validate(getHelpPostSchema),
  helpPostsController.deleteHelpPost
);

export default router;
