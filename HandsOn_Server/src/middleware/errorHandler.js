import { ZodError } from "zod";
import { AppError } from "../utils/response.js";
import logger from "../utils/logger.js";
import { env } from "../config/env.ts";

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      data: err.flatten(),
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  if (env.NODE_ENV !== "test") {
    logger.error(
      {
        err,
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
      },
      message
    );
  }

  res.status(statusCode).json({
    status: "error",
    message,
    data: null,
  });
};
