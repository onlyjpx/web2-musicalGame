/*
  Warnings:

  - Made the column `picture` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "senha" DROP NOT NULL,
ALTER COLUMN "picture" SET NOT NULL,
ALTER COLUMN "picture" SET DEFAULT 'https://cdn-icons-png.flaticon.com/512/17/17004.png';
