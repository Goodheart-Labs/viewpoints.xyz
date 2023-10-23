import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "./schema";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.POSTGRES_PRISMA_URL,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
