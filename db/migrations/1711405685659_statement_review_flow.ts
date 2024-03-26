import type { Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // Add 'visible' column to 'statements' table
  await db.schema
    .alterTable("statements")
    .addColumn("visible", "boolean", (col) => col.defaultTo(true))
    .execute();

  // Add 'new_statements_visible_by_default' column to 'polls' table
  await db.schema
    .alterTable("polls")
    .addColumn("new_statements_visible_by_default", "boolean", (col) =>
      col.defaultTo(false),
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Remove 'visible' column from 'statements' table
  await db.schema.alterTable("statements").dropColumn("visible").execute();

  // Remove 'new_statements_visible_by_default' column from 'polls' table
  await db.schema
    .alterTable("polls")
    .dropColumn("new_statements_visible_by_default")
    .execute();
}
