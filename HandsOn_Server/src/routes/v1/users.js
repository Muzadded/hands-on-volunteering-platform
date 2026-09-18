import { Router } from "express";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as usersController from "../../controllers/usersController.js";
import { getUserSchema, updateUserSchema } from "../../validators/users.ts";

const router = Router();

router.get("/me", authorization, usersController.getMe);
router.get("/me/impact", authorization, usersController.getImpact);
router.get("/:id", authorization, validate(getUserSchema), usersController.getUserById);
router.patch(
  "/:id",
  authorization,
  validate(updateUserSchema),
  usersController.updateUser
);
router.put(
  "/:id",
  authorization,
  validate(updateUserSchema),
  usersController.updateUser
);

export default router;
