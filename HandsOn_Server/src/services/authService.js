import bcrypt from "bcrypt";
import * as usersRepo from "../repositories/usersRepository.js";
import { signToken } from "../utils/jwt.js";
import { AppError } from "../utils/response.js";
import { normalizeTags } from "../utils/matching.js";

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

  const token = signToken(user.user_id);
  return { token, user_id: user.user_id };
}

export async function login({ email, password }) {
  const user = await usersRepo.findAuthByEmail(email);
  if (!user) {
    throw new AppError("User not found", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Invalid Password", 401);
  }

  const token = signToken(user.user_id);
  return { token, user_id: user.user_id };
}
