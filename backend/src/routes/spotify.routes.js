import express from 'express';
import { buscarMusicas } from '../controllers/spotify.controller.js';

const router = express.Router();

router.get("/search", buscarMusicas);

export default router;