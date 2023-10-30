import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "./schema";

let connectionString = process.env.DATABASE_URL;
if (!connectionString?.endsWith("sslmode=require")) {
  connectionString += "?sslmode=require";
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
