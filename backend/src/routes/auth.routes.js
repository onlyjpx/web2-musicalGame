import express from 'express';
import { registrar, login, googleLogin } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/registrar', registrar);
router.post('/login', login);
router.post('/google', googleLogin);

export default router;