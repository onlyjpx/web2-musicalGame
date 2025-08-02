/*
  Warnings:

  - You are about to drop the column `musicaId` on the `DesafioMusica` table. All the data in the column will be lost.
  - You are about to drop the `Musica` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[desafioId,spotifyId]` on the table `DesafioMusica` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spotifyId` to the `DesafioMusica` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DesafioMusica" DROP CONSTRAINT "DesafioMusica_musicaId_fkey";

-- DropForeignKey
ALTER TABLE "Musica" DROP CONSTRAINT "Musica_criadoPorId_fkey";

-- DropIndex
DROP INDEX "DesafioMusica_desafioId_musicaId_key";

-- AlterTable
ALTER TABLE "DesafioMusica" DROP COLUMN "musicaId",
ADD COLUMN     "spotifyId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Musica";

-- CreateIndex
CREATE UNIQUE INDEX "DesafioMusica_desafioId_spotifyId_key" ON "DesafioMusica"("desafioId", "spotifyId");
