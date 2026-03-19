-- CreateEnum
CREATE TYPE "SizeGroup" AS ENUM ('CLOTHING', 'PANTS', 'SHOES');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "sizeGroup" "SizeGroup";
