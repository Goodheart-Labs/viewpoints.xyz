CREATE TYPE "choice_enum" AS ENUM ('agree', 'disagree', 'skip', 'itsComplicated');
ALTER TABLE "responses"
ALTER COLUMN "valence" TYPE "choice_enum" USING "valence"::"choice_enum";
ALTER TABLE "responses"
  RENAME COLUMN "valence" TO "choice";