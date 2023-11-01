import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // let's rename the tables to make them more consistent

  await db.schema.alterTable("Statement").renameTo("statements").execute();
  await db.schema
    .alterTable("FlaggedStatement")
    .renameTo("flagged_statements")
    .execute();
  await db.schema.alterTable("Author").renameTo("authors").execute();
  await db.schema.alterTable("Comment").renameTo("comments").execute();

  // there is now a statement_options table, which contains the options for a statement

  await db.schema
    .createTable("statement_options")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("statement_id", "integer", (col) =>
      col.notNull().references("statements.id"),
    )
    .addColumn("option", "text", (col) => col.notNull())
    .addColumn("icon", "text")
    .execute();

  // statements can now have a custom question_type and answer_type

  await db.schema
    .createType("statements_question_type")
    .asEnum(["default", "demographic"])
    .execute();

  await db.schema
    .createType("statements_answer_type")
    .asEnum(["default", "custom_options"])
    .execute();

  await db.schema
    .alterTable("statements")
    .addColumn("question_type", sql`statements_question_type`, (col) =>
      col.defaultTo("default"),
    )
    .addColumn("answer_type", sql`statements_answer_type`, (col) =>
      col.defaultTo("default"),
    )
    .execute();

  // responses now keeps track of statement options, if the answer_type is custom_options

  await db.schema
    .alterTable("responses")
    .alterColumn("choice", (col) => col.dropNotNull())
    .execute();

  await db.schema
    .alterTable("responses")
    .addColumn("option_id", "integer", (col) =>
      col.references("statement_options.id"),
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("responses").dropColumn("option_id").execute();
  await db.schema
    .alterTable("responses")
    .alterColumn("choice", (col) => col.setNotNull())
    .execute();
  await db.schema.alterTable("statements").dropColumn("answer_type").execute();
  await db.schema
    .alterTable("statements")
    .dropColumn("question_type")
    .execute();
  await db.schema.dropType("statements_answer_type").execute();
  await db.schema.dropType("statements_question_type").execute();
  await db.schema.dropTable("statement_options").execute();
  await db.schema.alterTable("authors").renameTo("Author").execute();
  await db.schema
    .alterTable("flagged_statements")
    .renameTo("FlaggedStatement")
    .execute();
  await db.schema.alterTable("statements").renameTo("Statement").execute();
  await db.schema.alterTable("comments").renameTo("Comment").execute();
}
