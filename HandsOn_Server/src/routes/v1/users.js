import { Router } from "express";
import { z } from "zod";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as usersController from "../../controllers/usersController.js";
import { getUserSchema, updateUserSchema } from "../../validators/users.ts";

const router = Router();

router.get("/me", authorization, usersController.getMe);
router.get("/me/impact", authorization, usersController.getImpact);
router.get("/me/credentials", authorization, usersController.listCredentials);
router.post(
  "/me/credentials",
  authorization,
  validate(
    z.object({
      body: z.object({
        credential_type: z.string().min(1),
        label: z.string().optional().nullable(),
        document_url: z.string().url().optional().nullable().or(z.literal("")),
      }),
    })
  ),
  usersController.addCredential
);
router.delete(
  "/me/credentials/:credentialId",
  authorization,
  validate(
    z.object({
      params: z.object({
        credentialId: z.coerce.number().int().positive(),
      }),
    })
  ),
  usersController.removeCredential
);

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
