// This is a temporary schema, hard-coded to match the current database, which
// is defined with Prisma. I've decided I don't like Prisma, so we're going to
// move over to Kysely.
//
// TODO: Remove Prisma, auto-generate this schema from the database.

import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  polls: PollsTable;
  Statement: StatementTable;
  responses: ResponsesTable;
}

export interface PollsTable {
  id: Generated<number>;
  user_id: string;
  slug: string | null;
  title: string;
  core_question: string;
  created_at: ColumnType<Date, string | undefined, never>;
  visibility: "public" | "hidden" | "private";
  analytics_filters: object;
}

export type Poll = Selectable<PollsTable>;
export type NewPoll = Insertable<PollsTable>;
export type PollUpdate = Updateable<PollsTable>;

export interface StatementTable {
  id: Generated<number>;
  poll_id: number;
  user_id: string | null;
  session_id: string | null;
  text: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Statement = Selectable<StatementTable>;
export type NewStatement = Insertable<StatementTable>;
export type StatementUpdate = Updateable<StatementTable>;

export interface ResponsesTable {
  id: Generated<number>;
  user_id: string | null;
  statementId: number;
  session_id: string | null;
  choice: "agree" | "disagree" | "itsComplicated" | "skip";
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Response = Selectable<ResponsesTable>;
export type NewResponse = Insertable<ResponsesTable>;
export type ResponseUpdate = Updateable<ResponsesTable>;
