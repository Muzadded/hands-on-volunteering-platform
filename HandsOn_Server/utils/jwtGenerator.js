import { signToken } from "../src/utils/jwt.js";

export default function jwtGenerator(user_id) {
  return signToken(user_id);
}
