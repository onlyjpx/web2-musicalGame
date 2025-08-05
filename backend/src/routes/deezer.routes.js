import express from "express";
import { buscarMusicasDeezer } from "../controllers/deezer.controller.js";

const router = express.Router();
router.get("/", buscarMusicasDeezer);

export default router;
