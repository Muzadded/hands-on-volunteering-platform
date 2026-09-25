import { Router } from "express";
import rateLimit from "express-rate-limit";
import authorization from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as authController from "../../controllers/authController.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../../validators/auth.ts";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many auth attempts, please try again later",
    data: null,
  },
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many recovery attempts, please try again later",
    data: null,
  },
});

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/is-verify", authorization, authController.isVerify);

router.post(
  "/forgot-password",
  recoveryLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  recoveryLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  "/request-verification",
  authorization,
  recoveryLimiter,
  authController.requestVerification
);
router.post(
  "/verify-email",
  recoveryLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail
);

export default router;
