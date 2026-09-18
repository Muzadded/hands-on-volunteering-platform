import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      token: result.token,
      data: { user_id: result.user_id },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token: result.token,
      data: { user_id: result.user_id },
      // Compat for older clients
      user_id: result.user_id,
    });
  } catch (error) {
    next(error);
  }
}

export async function isVerify(req, res) {
  return sendSuccess(res, 200, "Token valid", true);
}
