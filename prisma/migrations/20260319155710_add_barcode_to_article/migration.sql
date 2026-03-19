/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Article` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "barcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Article_barcode_key" ON "Article"("barcode");
