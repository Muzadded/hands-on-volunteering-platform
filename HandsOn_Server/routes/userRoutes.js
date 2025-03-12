import express from "express";
import { getUserById, updateUser} from "../controllers/userController.js";

const router = express.Router();

// User routes
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
// router.get("/test", test);

export default router;
