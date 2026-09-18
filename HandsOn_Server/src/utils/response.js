export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const sendSuccess = (res, status, message, data = null) => {
  res.status(status).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res, status, message, data = null) => {
  res.status(status).json({
    status: "error",
    message,
    data,
  });
};
