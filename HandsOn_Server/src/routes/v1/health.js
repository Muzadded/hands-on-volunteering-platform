import { Router } from "express";
import pool from "../../../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "success",
      message: "OK",
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
