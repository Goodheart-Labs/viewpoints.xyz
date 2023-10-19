-- Create Author table and migrate data from Statement table
CREATE TABLE "Author" (
  "id" SERIAL NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Author" ("userId", "name", "avatarUrl")
SELECT DISTINCT "user_id",
  "author_name",
  "author_avatar_url"
FROM "Statement" WHERE "user_id" IS NOT NULL;


-- Remove unnecessary columns from Statement table
ALTER TABLE "Statement" DROP COLUMN "author_avatar_url",
  DROP COLUMN "author_name",
  DROP COLUMN "reporting_type";
DROP TYPE "reporting_type_enum";


-- Set poll user_id to required
ALTER TABLE "polls"
ALTER COLUMN "user_id"
SET NOT NULL;

-- Create Comment table
CREATE TABLE "Comment" (
  "id" SERIAL NOT NULL,
  "userId" TEXT,
  "sessionId" VARCHAR NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pollId" INTEGER NOT NULL,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "Author_id_key" ON "Author"("id");
-- CreateIndex
CREATE UNIQUE INDEX "Author_userId_key" ON "Author"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "Comment_id_key" ON "Comment"("id");
-- AddForeignKey
ALTER TABLE "Statement"
ADD CONSTRAINT "Statement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Author"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Author"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION;