/*
  Warnings:

  - You are about to drop the column `edited_from_id` on the `Statement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Statement" DROP CONSTRAINT "Statement_edited_from_id_fkey";

-- AlterTable
ALTER TABLE "Statement" DROP COLUMN "edited_from_id";
