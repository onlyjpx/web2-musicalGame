/*
  Warnings:

  - Made the column `createdAt` on table `Desafio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Desafio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `DesafioMusica` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Desafio" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DesafioMusica" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
