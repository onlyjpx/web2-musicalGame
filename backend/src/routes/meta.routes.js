import express from 'express';
import { LIMITES } from '../utils/validation.js';

const router = express.Router();

router.get('/limites', (_req, res) => {
  res.json({ limites: LIMITES });
});

export default router;
