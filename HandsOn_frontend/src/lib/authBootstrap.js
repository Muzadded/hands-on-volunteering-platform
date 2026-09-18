/**
 * Resolve auth state from a decoded JWT payload.
 */
export function resolveAuthFromDecoded(decoded, now = Date.now()) {
  if (!decoded) {
    return { isAuthenticated: false, userId: null };
  }

  const expMs = decoded.exp ? decoded.exp * 1000 : 0;
  if (!expMs || expMs <= now) {
    return { isAuthenticated: false, userId: null, expired: true };
  }

  return { isAuthenticated: true, userId: decoded.user };
}
