import express from 'express';
import { getProfile, updatePicture } from '../controllers/profile.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', autenticar, getProfile);
router.put('/picture', autenticar, updatePicture);

export default router;