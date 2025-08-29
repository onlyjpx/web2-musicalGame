import express from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { startGame, getCurrent, submitGuess } from '../controllers/game.controller.js';

const router = express.Router();

router.post('/start/:desafioId', autenticar, startGame);
router.get('/current/:sessionId', autenticar, getCurrent);
router.post('/guess/:sessionId', autenticar, submitGuess);

export default router;
