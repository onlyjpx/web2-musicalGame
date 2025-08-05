/*
  Warnings:

  - You are about to drop the column `spotifyId` on the `DesafioMusica` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[desafioId,deezerId]` on the table `DesafioMusica` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deezerId` to the `DesafioMusica` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DesafioMusica_desafioId_spotifyId_key";

-- AlterTable
ALTER TABLE "DesafioMusica" DROP COLUMN "spotifyId",
ADD COLUMN     "deezerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DesafioMusica_desafioId_deezerId_key" ON "DesafioMusica"("desafioId", "deezerId");
