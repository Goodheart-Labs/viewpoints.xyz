import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";

let connectionString = process.env.DATABASE_URL;
if (
  !connectionString?.endsWith("sslmode=require") &&
  process.env.NODE_ENV === "production"
) {
  connectionString += "?sslmode=require";
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
