import express from 'express';
import { LIMITES } from '../utils/validation.js';
import { getStats } from '../controllers/meta.controller.js';

const router = express.Router();

router.get('/limites', (_req, res) => {
  res.json({ limites: LIMITES });
});

router.get('/stats', getStats);

export default router;
