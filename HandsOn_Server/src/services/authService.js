import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import * as usersRepo from "../repositories/usersRepository.js";
import * as authTokensRepo from "../repositories/authTokensRepository.js";
import { signToken } from "../utils/jwt.js";
import { AppError } from "../utils/response.js";
import { normalizeTags } from "../utils/matching.js";
import { sendMail } from "../utils/mailer.js";
import { env } from "../config/env.ts";

const INVALID_CREDENTIALS = "Invalid email or password";
const TIMING_PAD_HASH =
  "$2b$10$eBbrYpFeQwebtI.Gep4B6e65Gm4t6Hk01ItkBudNs8e51/t2Gon6e";
const GENERIC_RESET_MESSAGE =
  "If an account exists for that email, recovery instructions have been sent.";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function createRawToken() {
  return randomBytes(32).toString("hex");
}

async function issueToken(userId, purpose, ttlMs) {
  await authTokensRepo.invalidateUserTokens(userId, purpose);
  const raw = createRawToken();
  const expiresAt = new Date(Date.now() + ttlMs);
  await authTokensRepo.createToken({
    userId,
    purpose,
    tokenHash: hashToken(raw),
    expiresAt,
  });
  return raw;
}

export async function register(input) {
  if (await usersRepo.emailExists(input.email)) {
    throw new AppError("User already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);
  const user = await usersRepo.createUser({
    name: input.name,
    gender: input.gender,
    dob: input.dob,
    email: input.email,
    passwordHash,
    about: input.about ?? null,
    skills: normalizeTags(input.skills),
    causes: normalizeTags(input.causes),
  });

  // Best-effort verification email; registration still succeeds if mail fails.
  try {
    await requestEmailVerification(user.user_id, input.email);
  } catch {
    // ignore
  }

  const token = signToken(user.user_id);
  return { token, user_id: user.user_id };
}

export async function login({ email, password }) {
  const user = await usersRepo.findAuthByEmail(email);
  const hash = user?.password || TIMING_PAD_HASH;
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw new AppError(INVALID_CREDENTIALS, 401);
  }

  const token = signToken(user.user_id);
  return { token, user_id: user.user_id };
}

export async function requestPasswordReset(email) {
  const user = await usersRepo.findAuthByEmail(email);
  if (user) {
    const raw = await issueToken(user.user_id, "password_reset", 60 * 60 * 1000);
    const link = `${env.CLIENT_ORIGIN}/reset-password?token=${raw}`;
    await sendMail({
      to: user.email || email,
      subject: "Reset your HandsOn password",
      text: `Use this link within 1 hour to reset your password:\n\n${link}\n\nIf you did not request this, you can ignore this email.`,
    });
  }
  return { message: GENERIC_RESET_MESSAGE };
}

export async function resetPassword(token, newPassword) {
  const row = await authTokensRepo.findValidToken(
    "password_reset",
    hashToken(token)
  );
  if (!row) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  await usersRepo.updatePassword(row.user_id, passwordHash);
  await authTokensRepo.markUsed(row.id);
  await authTokensRepo.invalidateUserTokens(row.user_id, "password_reset");

  return { message: "Password updated successfully" };
}

export async function requestEmailVerification(userId, emailHint) {
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.email_verified_at) {
    return { message: "Email is already verified" };
  }

  const email = emailHint || user.email;
  const raw = await issueToken(userId, "email_verify", 24 * 60 * 60 * 1000);
  const link = `${env.CLIENT_ORIGIN}/verify-email?token=${raw}`;
  await sendMail({
    to: email,
    subject: "Verify your HandsOn email",
    text: `Verify your email within 24 hours:\n\n${link}`,
  });

  return { message: "Verification email sent" };
}

export async function verifyEmail(token) {
  const row = await authTokensRepo.findValidToken(
    "email_verify",
    hashToken(token)
  );
  if (!row) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  await usersRepo.markEmailVerified(row.user_id);
  await authTokensRepo.markUsed(row.id);
  await authTokensRepo.invalidateUserTokens(row.user_id, "email_verify");

  return { message: "Email verified successfully" };
}
