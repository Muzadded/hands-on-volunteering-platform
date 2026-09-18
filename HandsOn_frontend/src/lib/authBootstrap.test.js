import { describe, expect, it } from "vitest";
import { resolveAuthFromDecoded } from "./authBootstrap";

describe("resolveAuthFromDecoded", () => {
  it("returns unauthenticated when decoded is missing", () => {
    expect(resolveAuthFromDecoded(null)).toEqual({
      isAuthenticated: false,
      userId: null,
    });
  });

  it("returns expired when exp is in the past", () => {
    const result = resolveAuthFromDecoded(
      { user: 42, exp: Math.floor(Date.now() / 1000) - 10 },
      Date.now()
    );
    expect(result).toEqual({
      isAuthenticated: false,
      userId: null,
      expired: true,
    });
  });

  it("returns authenticated with user id when token is valid", () => {
    const result = resolveAuthFromDecoded(
      { user: 7, exp: Math.floor(Date.now() / 1000) + 3600 },
      Date.now()
    );
    expect(result).toEqual({ isAuthenticated: true, userId: 7 });
  });
});
