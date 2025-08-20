-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "picture" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local';
