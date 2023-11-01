import type { Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("sessions")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("user_id", "text")
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("sessions").execute();
}
