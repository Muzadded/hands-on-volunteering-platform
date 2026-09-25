import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/usersRepository.js", () => ({
  emailExists: vi.fn(),
  createUser: vi.fn(),
  findAuthByEmail: vi.fn(),
  findById: vi.fn(),
  updatePassword: vi.fn(),
  markEmailVerified: vi.fn(),
}));

vi.mock("../src/repositories/authTokensRepository.js", () => ({
  invalidateUserTokens: vi.fn(),
  createToken: vi.fn(),
  findValidToken: vi.fn(),
  markUsed: vi.fn(),
}));

vi.mock("../src/utils/jwt.js", () => ({
  signToken: vi.fn(() => "token"),
}));

vi.mock("../src/utils/mailer.js", () => ({
  sendMail: vi.fn(async () => ({ queued: true })),
}));

vi.mock("bcrypt", () => ({
  default: {
    genSalt: vi.fn(async () => "salt"),
    hash: vi.fn(async () => "hashed"),
    compare: vi.fn(),
  },
}));

import bcrypt from "bcrypt";
import * as usersRepo from "../src/repositories/usersRepository.js";
import * as authTokensRepo from "../src/repositories/authTokensRepository.js";
import { sendMail } from "../src/utils/mailer.js";
import {
  login,
  requestPasswordReset,
  resetPassword,
} from "../src/services/authService.js";

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the same error for unknown email and wrong password", async () => {
    usersRepo.findAuthByEmail.mockResolvedValueOnce(null);
    bcrypt.compare.mockResolvedValueOnce(false);

    await expect(
      login({ email: "missing@test.local", password: "x" })
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: 401,
    });

    usersRepo.findAuthByEmail.mockResolvedValueOnce({
      user_id: 1,
      password: "realhash",
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    await expect(
      login({ email: "exists@test.local", password: "wrong" })
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: 401,
    });
  });
});

describe("authService password recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a generic message whether or not the email exists", async () => {
    usersRepo.findAuthByEmail.mockResolvedValueOnce(null);
    const missing = await requestPasswordReset("missing@test.local");
    expect(missing.message).toMatch(/if an account exists/i);
    expect(sendMail).not.toHaveBeenCalled();

    usersRepo.findAuthByEmail.mockResolvedValueOnce({
      user_id: 7,
      email: "exists@test.local",
    });
    authTokensRepo.createToken.mockResolvedValueOnce({ id: 1 });
    const exists = await requestPasswordReset("exists@test.local");
    expect(exists.message).toBe(missing.message);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it("rejects invalid reset tokens", async () => {
    authTokensRepo.findValidToken.mockResolvedValueOnce(null);
    await expect(resetPassword("a".repeat(40), "NewPass123!")).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
