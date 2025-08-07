import express from "express";
import { autenticar } from "../middlewares/auth.middleware.js";
import { adicionarMusicaAoDesafio, listarMusicasDoDesafio, deletarMusicaDoDesafio } from "../controllers/desafioMusica.controller.js";

const router = express.Router();

router.post("/:id", autenticar, adicionarMusicaAoDesafio);
router.get("/:id", listarMusicasDoDesafio);
router.delete("/:id", autenticar, deletarMusicaDoDesafio);

export default router;