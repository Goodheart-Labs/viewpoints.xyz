-- AlterTable
ALTER TABLE "FlaggedStatement" ADD COLUMN     "description" TEXT;

-- RenameForeignKey
ALTER TABLE "Statement" RENAME CONSTRAINT "comments_edited_from_id_fkey" TO "Statement_edited_from_id_fkey";
