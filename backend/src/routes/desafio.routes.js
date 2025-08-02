import express from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { criarDesafio, listarDesafios, atualizarDesafio, deletarDesafio, obterDesafios } from '../controllers/desafio.controller.js';

const router = express.Router();

router.get("/", autenticar, listarDesafios);
router.get("/:id", autenticar, obterDesafios);
router.post("/", autenticar, criarDesafio);
router.put("/:id", autenticar, atualizarDesafio);
router.delete("/:id", autenticar, deletarDesafio);

export default router;