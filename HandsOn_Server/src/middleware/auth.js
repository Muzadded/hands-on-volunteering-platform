import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

function extractToken(req) {
  const authHeader = req.header("Authorization") || req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  // EventSource cannot set Authorization headers — allow token query for SSE.
  if (req.query?.token) {
    return String(req.query.token);
  }
  return req.header("token") || null;
}

export default function authorization(req, res, next) {
  try {
    const jwtToken = extractToken(req);
    if (!jwtToken) {
      return sendError(res, 401, "Not Authorized");
    }

    const payload = verifyToken(jwtToken);
    req.user = payload.user;
    next();
  } catch {
    return sendError(res, 401, "Not Authorized");
  }
}
