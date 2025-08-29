-- Add timestamp columns to Desafio and DesafioMusica
ALTER TABLE "Desafio" ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE "Desafio" ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE "DesafioMusica" ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- Backfill existing rows
UPDATE "Desafio" SET "createdAt" = NOW(), "updatedAt" = NOW() WHERE "createdAt" IS NULL;
UPDATE "DesafioMusica" SET "createdAt" = NOW() WHERE "createdAt" IS NULL;
