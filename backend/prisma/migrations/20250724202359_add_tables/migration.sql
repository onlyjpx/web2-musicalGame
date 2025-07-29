-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Desafio" (
    "id" SERIAL NOT NULL,
    "nomeMusica" TEXT NOT NULL,
    "artista" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "dificuldade" INTEGER NOT NULL,

    CONSTRAINT "Desafio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tentativa" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "desafioId" INTEGER NOT NULL,
    "acertou" BOOLEAN NOT NULL,
    "tempoResposta" INTEGER,
    "pontos" INTEGER NOT NULL,

    CONSTRAINT "Tentativa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Tentativa" ADD CONSTRAINT "Tentativa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tentativa" ADD CONSTRAINT "Tentativa_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "Desafio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
