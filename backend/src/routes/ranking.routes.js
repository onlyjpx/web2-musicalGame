import express from 'express';
import { rankingGlobal } from '../controllers/ranking.controller.js';

const router = express.Router();

router.get('/global', rankingGlobal);

export default router;
