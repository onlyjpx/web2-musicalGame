/*
  Warnings:

  - A unique constraint covering the columns `[desafioId,musicaId]` on the table `DesafioMusica` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyId]` on the table `Musica` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spotifyId` to the `Musica` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DesafioMusica" DROP CONSTRAINT "DesafioMusica_desafioId_fkey";

-- DropForeignKey
ALTER TABLE "DesafioMusica" DROP CONSTRAINT "DesafioMusica_musicaId_fkey";

-- DropForeignKey
ALTER TABLE "Tentativa" DROP CONSTRAINT "Tentativa_desafioId_fkey";

-- DropForeignKey
ALTER TABLE "Tentativa" DROP CONSTRAINT "Tentativa_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Musica" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "criadoPorId" INTEGER,
ADD COLUMN     "duracaoMs" INTEGER,
ADD COLUMN     "imagemUrl" TEXT,
ADD COLUMN     "popularidade" INTEGER,
ADD COLUMN     "spotifyId" TEXT NOT NULL,
ADD COLUMN     "urlSpotify" TEXT;

-- AlterTable
ALTER TABLE "Tentativa" ALTER COLUMN "tempoResposta" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "DesafioMusica_desafioId_musicaId_key" ON "DesafioMusica"("desafioId", "musicaId");

-- CreateIndex
CREATE UNIQUE INDEX "Musica_spotifyId_key" ON "Musica"("spotifyId");

-- AddForeignKey
ALTER TABLE "Tentativa" ADD CONSTRAINT "Tentativa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tentativa" ADD CONSTRAINT "Tentativa_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "Desafio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Musica" ADD CONSTRAINT "Musica_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesafioMusica" ADD CONSTRAINT "DesafioMusica_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "Desafio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesafioMusica" ADD CONSTRAINT "DesafioMusica_musicaId_fkey" FOREIGN KEY ("musicaId") REFERENCES "Musica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
