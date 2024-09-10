/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import { Pool } from "pg";

if (
  !process.env.SOURCE ||
  !process.env.TARGET ||
  !process.env.POLL_ID ||
  !process.env.USER_ID
) {
  throw new Error(
    '"SOURCE=xxx TARGET=xxx POLL_ID=xxx USER_ID=xxx  bun run scripts/import-poll.ts"',
  );
}

const sourceClient = createConnection(process.env.SOURCE);
const targetClient = createConnection(process.env.TARGET);

// Get the poll
const poll = await sourceClient
  .selectFrom("polls")
  .selectAll()
  .where("id", "=", parseInt(process.env.POLL_ID))
  .executeTakeFirst();

if (!poll) {
  throw new Error(
    `Poll ${process.env.POLL_ID} does not exist in the source database`,
  );
}

const { id: _, user_id: __, ...pollWithoutId } = poll;

// Copy the poll
const newPoll = await targetClient
  .insertInto("polls")
  .values({ ...pollWithoutId, user_id: process.env.USER_ID })
  .returningAll()
  .executeTakeFirst();

if (!newPoll) {
  throw new Error("Failed to insert poll into target database");
}

// Load all the statements for the source poll
const statements = await sourceClient
  .selectFrom("statements")
  .selectAll()
  .where("poll_id", "=", poll.id)
  .execute();

// Insert each statement, replacing the poll_id with the new poll_id
const insertPromises = statements.map(({ id, user_id, ...statement }) =>
  targetClient
    .insertInto("statements")
    .values({ ...statement, poll_id: newPoll.id, user_id: process.env.USER_ID })
    .execute(),
);

await Promise.all(insertPromises);

console.log("Successfully imported poll");

// Exit successfully
process.exit(0);

function createConnection(connectionString: string) {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString,
    }),
  });

  return new Kysely<DB>({
    dialect,
  });
}
