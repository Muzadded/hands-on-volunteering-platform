import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export function signToken(userId) {
  return jwt.sign({ user: userId }, env.JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
