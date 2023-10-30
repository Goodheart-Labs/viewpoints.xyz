import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("_prisma_migrations").execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`
    CREATE TABLE "public"."_prisma_migrations" (
      "id" varchar NOT NULL,
      "checksum" varchar NOT NULL,
      "finished_at" timestamptz,
      "migration_name" varchar NOT NULL,
      "logs" text,
      "rolled_back_at" timestamptz,
      "started_at" timestamptz NOT NULL DEFAULT now(),
      "applied_steps_count" int4 NOT NULL DEFAULT 0,
      PRIMARY KEY ("id")
    );
  `.execute(db);

  await sql`
    INSERT INTO "public"."_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES
    ('0bf2d42f-067a-47e6-91c3-714366964810', '485372434313bece52c35189c620df4d59a280f3e2156e48e3c37dfbc1163839', '2023-10-19 20:00:52.006303+02', '20230814201226_fix_rename_comments_to_statement', NULL, NULL, '2023-10-19 20:00:52.005655+02', 1),
    ('58fca389-3cc9-49fe-aef0-ff641dec0f1b', 'a1220d7174689f102ce7d57bbfecb5870432b4a3d53ecbb2d40a29a32f94d7fb', '2023-10-19 20:00:51.999454+02', '0_init', NULL, NULL, '2023-10-19 20:00:51.983839+02', 1),
    ('a6f06fc5-41e5-46cc-af8d-da2db4e6ca7d', '9b2b88d149edd8b1bca9bc7ed8c7af5fa519eb061375df0c76b36a4fcdd3d43d', '2023-10-19 20:00:52.013373+02', '20230821141430_remove_statement_editing', NULL, NULL, '2023-10-19 20:00:52.012603+02', 1),
    ('aa5daa22-e72f-45d5-969d-c8645793fab9', 'b4a2a00686e61955b85794e8ba4a8a9d35d2e23b67a52bcc7b630b0beeb938ee', '2023-10-19 20:00:52.003544+02', '20230803111931_rename_valence_to_choice', NULL, NULL, '2023-10-19 20:00:51.999967+02', 1),
    ('b6d334cc-e99a-4487-bbfe-c922f985177a', '4eabb127ab2d2d8100983f202d13ebacd3f58e358d08033afd644b590e2e2ef5', '2023-10-19 20:00:52.011343+02', '20230815115418_add_author_table', NULL, NULL, '2023-10-19 20:00:52.006567+02', 1),
    ('e23121b1-edb9-4b77-a047-799ee235bae5', '2de84a15ece4190e37590f6fb84e74519592902cc49583fcea34f27db06a61a1', '2023-10-19 20:00:52.012329+02', '20230820145837_add_description_to_flagged_statements', NULL, NULL, '2023-10-19 20:00:52.011597+02', 1),
    ('ea1af5e1-a149-4167-be77-42142b5244d0', 'dd83b9ab6ac528a6d5d63740ddce952c4ed0f08fd8b8b9281143359773c01624', '2023-10-19 20:00:52.005234+02', '20230814201225_rename_comments_to_statement', NULL, NULL, '2023-10-19 20:00:52.003969+02', 1);
  `.execute(db);
}
