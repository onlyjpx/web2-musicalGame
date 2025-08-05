import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import desafioRoutes from "./routes/desafio.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import deezerRoutes from "./routes/deezer.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/desafios", desafioRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/deezer", deezerRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Servidor rodando!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
