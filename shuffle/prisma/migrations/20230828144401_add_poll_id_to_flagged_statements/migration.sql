/*
  Warnings:

  - Added the required column `poll_id` to the `FlaggedStatement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

-- AddForeignKey

ALTER TABLE "FlaggedStatement" ADD COLUMN "poll_id" INTEGER;

UPDATE "FlaggedStatement" SET "poll_id" = (
    SELECT "Statement"."poll_id" 
    FROM "Statement" 
    WHERE "Statement"."id" = "FlaggedStatement"."statementId"
);

ALTER TABLE "FlaggedStatement" ALTER COLUMN "poll_id" SET NOT NULL;

ALTER TABLE "FlaggedStatement" ADD CONSTRAINT "FlaggedStatement_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION;