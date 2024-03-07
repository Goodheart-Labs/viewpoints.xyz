import type { Insertable, Selectable } from "kysely";
import type { DB } from "kysely-codegen";

/**
 * Types are generated during postinall by the kysely-codegen plugin.
 *
 * These types are helpful for type checking and autocompletion when working with the database.
 */

export type Database = DB;
export type Poll = Selectable<DB["polls"]>;
export type Statement = Selectable<DB["statements"]>;
export type NewStatement = Insertable<DB["statements"]>;
export type StatementOption = Selectable<DB["statement_options"]>;
export type FlaggedStatement = Selectable<DB["flagged_statements"]>;
export type Response = Selectable<DB["responses"]>;
export type Author = Selectable<DB["authors"]>;
