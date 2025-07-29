import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ message: "Servidor rodando!" });
});

app.get("/usuarios", async (req, res) => {
  const usuarios = await prisma.usuario.findMany();
  res.json(usuarios);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
