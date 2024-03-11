/* eslint-disable no-console */

import * as path from "path";
import { Pool } from "pg";
import { promises as fs } from "fs";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from "kysely";
import type { Database } from "./schema";

// Setup
// -----------------------------------------------------------------------------

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),
  }),
});

const newMigrationTemplate = `import type { Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // up
}

export async function down(db: Kysely<Database>): Promise<void> {
  // down
}
`;

// Up
// -----------------------------------------------------------------------------

async function migrateUp() {
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate up");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

// Down
// -----------------------------------------------------------------------------

async function migrateDown() {
  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was reverted successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to revert migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate down");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

// Version
// -----------------------------------------------------------------------------

async function migrateVersion() {
  const migrations = await migrator.getMigrations();

  const lastMigrationToBeExecuted = migrations
    .filter((it) => !!it.executedAt)
    .slice(-1)[0];

  const migrationsToExecute = migrations.filter((it) => !it.executedAt);

  if (lastMigrationToBeExecuted) {
    console.log(
      `last migration to be executed: ${lastMigrationToBeExecuted?.name}`,
    );
  }

  if (migrationsToExecute.length === 0) {
    console.log("no more migrations to execute");
  } else {
    console.log("migrations to execute:");
    migrationsToExecute.forEach((it) => console.log(`- ${it.name}`));
  }

  await db.destroy();
}

// Make
// -----------------------------------------------------------------------------

async function migrateMake() {
  const name = process.argv[3];
  if (!name) {
    console.error("missing migration name");
    process.exit(1);
  }

  const filename = `${Date.now()}_${name}.ts`;
  const filepath = path.join(__dirname, "migrations", filename);

  await fs.writeFile(filepath, newMigrationTemplate);

  console.log(`created migration "${filename}"`);
  await db.destroy();
}

// Handle command
// -----------------------------------------------------------------------------

const [cmd] = process.argv.slice(2);

switch (cmd) {
  case "up":
    migrateUp();
    break;

  case "down":
    migrateDown();
    break;

  case "version":
    migrateVersion();
    break;

  case "make":
    migrateMake();
    break;

  default:
    console.error(`Usage: bun run migrate <command>`);
    console.error(`Available commands: up, down, version, make`);
    break;
}
