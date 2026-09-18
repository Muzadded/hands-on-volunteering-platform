import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

vi.mock("axios", () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => instance),
      __instance: instance,
    },
  };
});

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("attaches Authorization header when token exists", async () => {
    localStorage.setItem("token", "test-jwt");
    await import("../api/client.js");
    const instance = axios.__instance;
    const requestHandler = instance.interceptors.request.use.mock.calls[0][0];
    const config = await requestHandler({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer test-jwt");
  });

  it("clears session on 401 for protected routes", async () => {
    localStorage.setItem("token", "stale");
    localStorage.setItem("user_id", "1");
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/1", assign: vi.fn() },
      writable: true,
    });

    await import("../api/client.js");
    const instance = axios.__instance;
    const errorHandler = instance.interceptors.response.use.mock.calls[0][1];

    await expect(
      errorHandler({
        response: { status: 401 },
        config: { url: "/events" },
      })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith("/login");
  });
});
