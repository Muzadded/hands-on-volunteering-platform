import express from 'express';
import { getUserById } from '../controllers/userController.js';

const router = express.Router();



// Get user by ID
router.get('/users/:id', getUserById);

export default router;
