-- CreateEnum
CREATE TYPE "polls_visibility_enum" AS ENUM ('public', 'hidden', 'private');

-- CreateEnum
CREATE TYPE "reporting_type_enum" AS ENUM ('default', 'demographic');

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "poll_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "edited_from_id" INTEGER,
    "session_id" VARCHAR,
    "reporting_type" "reporting_type_enum" DEFAULT 'default',
    "author_name" TEXT,
    "author_avatar_url" TEXT,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagged_comments" (
    "id" SERIAL NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "session_id" VARCHAR NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flagged_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "slug" VARCHAR,
    "title" VARCHAR NOT NULL,
    "core_question" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" "polls_visibility_enum" NOT NULL DEFAULT 'public',
    "analytics_filters" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "comment_id" INTEGER NOT NULL,
    "session_id" VARCHAR NOT NULL,
    "valence" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comments_id_key" ON "comments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "flagged_comments_id_key" ON "flagged_comments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "polls_id_key" ON "polls"("id");

-- CreateIndex
CREATE UNIQUE INDEX "polls_slug_key" ON "polls"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "responses_id_key" ON "responses"("id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_edited_from_id_fkey" FOREIGN KEY ("edited_from_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "flagged_comments" ADD CONSTRAINT "flagged_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
