import { Router } from "express";
import authorization from "../src/middleware/auth.js";
import * as usersService from "../src/services/usersService.js";

const router = Router();

// Legacy shape: bare user object (no envelope) for older clients
router.get("/", authorization, async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.user);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
