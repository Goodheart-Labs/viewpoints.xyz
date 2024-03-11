// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // Update existing responses with 'itsComplicated' to 'skip'
  await db
    .updateTable("responses")
    .set({ choice: "skip" })
    .where("choice", "=", "itsComplicated")
    .execute();

  // Remove 'itsComplicated' from the choice_enum
  await sql`
    ALTER TYPE public.choice_enum 
    RENAME TO choice_enum_old;
  `.execute(db);

  await sql`
    CREATE TYPE public.choice_enum AS ENUM (
      'agree',
      'disagree',
      'skip'
    );
  `.execute(db);

  await sql`
    ALTER TABLE public.responses 
    ALTER COLUMN choice TYPE public.choice_enum 
    USING choice::text::public.choice_enum;
  `.execute(db);

  await sql`
    DROP TYPE public.choice_enum_old;
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Recreate the old enum with 'itsComplicated'
  await sql`
    ALTER TYPE public.choice_enum 
    RENAME TO choice_enum_new;
  `.execute(db);

  await sql`
    CREATE TYPE public.choice_enum AS ENUM (
      'agree',
      'disagree',
      'skip',
      'itsComplicated'
    );
  `.execute(db);

  // Update the column to use the old enum
  await sql`
    ALTER TABLE public.responses 
    ALTER COLUMN choice TYPE public.choice_enum 
    USING choice::text::public.choice_enum;
  `.execute(db);

  // Drop the new enum without 'itsComplicated'
  await sql`
    DROP TYPE public.choice_enum_new;
  `.execute(db);

  // No need to update the 'skip' back to 'itsComplicated' as this would be data loss
}
