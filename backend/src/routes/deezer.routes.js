import express from 'express';
import { searchDeezer } from '../controllers/deezer.controller.js';

const router = express.Router();

router.get('/search', searchDeezer);

export default router;
