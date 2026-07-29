import "dotenv/config";
import express from "express";
import cors from "cors";
import process from "process";
import authRoutes from "./routes/auth.routes.js";
import desafioRoutes from "./routes/desafio.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import desafioMusicaRoutes from "./routes/desafioMusica.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import gameRoutes from "./routes/game.routes.js";
import deezerRoutes from './routes/deezer.routes.js';
import profileRoutes from './routes/profile.routes.js';
import rankingRoutes from './routes/ranking.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/desafios", desafioRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/desafio-musica", desafioMusicaRoutes);
app.use("/meta", metaRoutes);
app.use('/game', gameRoutes);
app.use('/deezer', deezerRoutes);
app.use('/profile', profileRoutes);
app.use('/ranking', rankingRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Servidor rodando!" });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
