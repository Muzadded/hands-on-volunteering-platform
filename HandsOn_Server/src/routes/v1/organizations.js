import { Router } from "express";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as organizationsController from "../../controllers/organizationsController.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationKeySchema,
  verifyOrganizationSchema,
} from "../../validators/organizations.ts";

const router = Router();

router.use(authorization);

router.get("/", organizationsController.listOrganizations);
router.get("/mine", organizationsController.listMyOrganizations);
router.post(
  "/",
  validate(createOrganizationSchema),
  organizationsController.createOrganization
);
router.get(
  "/:idOrSlug",
  validate(organizationKeySchema),
  organizationsController.getOrganization
);
router.patch(
  "/:id",
  validate(updateOrganizationSchema),
  organizationsController.updateOrganization
);
router.post(
  "/:id/verify",
  validate(verifyOrganizationSchema),
  organizationsController.verifyOrganization
);

export default router;
