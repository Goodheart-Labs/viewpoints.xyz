-- Rename tables
ALTER TABLE "comments"
  RENAME TO "Statement";
ALTER TABLE "flagged_comments"
  RENAME TO "FlaggedStatement";
-- Rename columns
ALTER TABLE "Statement"
  RENAME COLUMN "comment" TO "text";
ALTER TABLE "FlaggedStatement"
  RENAME COLUMN "comment_id" TO "statementId";
ALTER TABLE "responses"
  RENAME COLUMN "comment_id" TO "statementId";
-- AlterTable
ALTER TABLE "FlaggedStatement"
  RENAME CONSTRAINT "flagged_comments_pkey" TO "FlaggedStatement_pkey";
-- AlterTable
ALTER TABLE "Statement"
  RENAME CONSTRAINT "comments_pkey" TO "Statement_pkey";
-- RenameForeignKey
ALTER TABLE "FlaggedStatement"
  RENAME CONSTRAINT "flagged_comments_comment_id_fkey" TO "FlaggedStatement_statementId_fkey";
-- RenameForeignKey
ALTER TABLE "Statement"
  RENAME CONSTRAINT "comments_poll_id_fkey" TO "Statement_poll_id_fkey";
-- RenameForeignKey
ALTER TABLE "responses"
  RENAME CONSTRAINT "responses_comment_id_fkey" TO "responses_statementId_fkey";
-- RenameIndex
ALTER INDEX "flagged_comments_id_key"
RENAME TO "FlaggedStatement_id_key";
-- RenameIndex
ALTER INDEX "comments_id_key"
RENAME TO "Statement_id_key";