import { Router } from "express";
import rateLimit from "express-rate-limit";
import authorization from "../src/middleware/auth.js";
import { validate } from "../src/middleware/validate.js";
import * as authController from "../src/controllers/authController.js";
import { registerSchema, loginSchema } from "../src/validators/auth.ts";

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

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/is-verify", authorization, authController.isVerify);

export default router;
