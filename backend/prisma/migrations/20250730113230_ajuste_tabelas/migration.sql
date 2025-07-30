/*
  Warnings:

  - You are about to drop the column `album` on the `Desafio` table. All the data in the column will be lost.
  - You are about to drop the column `artista` on the `Desafio` table. All the data in the column will be lost.
  - You are about to drop the column `nomeMusica` on the `Desafio` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `Desafio` table. All the data in the column will be lost.
  - Added the required column `titulo` to the `Desafio` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `dificuldade` on the `Desafio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Dificuldade" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL', 'MUITO_DIFICIL', 'EXTREMO');

-- AlterTable
ALTER TABLE "Desafio" DROP COLUMN "album",
DROP COLUMN "artista",
DROP COLUMN "nomeMusica",
DROP COLUMN "previewUrl",
ADD COLUMN     "titulo" TEXT NOT NULL,
DROP COLUMN "dificuldade",
ADD COLUMN     "dificuldade" "Dificuldade" NOT NULL;

-- CreateTable
CREATE TABLE "Musica" (
    "id" SERIAL NOT NULL,
    "nomeCorreto" TEXT NOT NULL,
    "artista" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "urlPreview" TEXT NOT NULL,

    CONSTRAINT "Musica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesafioMusica" (
    "id" SERIAL NOT NULL,
    "desafioId" INTEGER NOT NULL,
    "musicaId" INTEGER NOT NULL,

    CONSTRAINT "DesafioMusica_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DesafioMusica" ADD CONSTRAINT "DesafioMusica_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "Desafio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesafioMusica" ADD CONSTRAINT "DesafioMusica_musicaId_fkey" FOREIGN KEY ("musicaId") REFERENCES "Musica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
