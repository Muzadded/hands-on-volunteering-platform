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
} from "../../validators/helpPosts.ts";

const router = Router();

router.use(authorization);

router.get("/", validate(listHelpPostsSchema), helpPostsController.listHelpPosts);
router.post("/", validate(createHelpPostSchema), helpPostsController.createHelpPost);
router.get("/:id", validate(getHelpPostSchema), helpPostsController.getHelpPost);
router.post(
  "/:id/comments",
  validate(addCommentSchema),
  helpPostsController.addComment
);
router.post("/:id/claim", validate(getHelpPostSchema), helpPostsController.claimHelpPost);
router.patch(
  "/:id",
  validate(updateHelpPostSchema),
  helpPostsController.updateHelpPost
);

export default router;
