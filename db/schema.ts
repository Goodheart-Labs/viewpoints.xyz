import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  Author: AuthorTable;
  polls: PollsTable;
  Statement: StatementTable;
  FlaggedStatement: FlaggedStatementTable;
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
  session_id: string;
  text: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Statement = Selectable<StatementTable>;
export type NewStatement = Insertable<StatementTable>;
export type StatementUpdate = Updateable<StatementTable>;

export interface FlaggedStatementTable {
  id: Generated<number>;
  statementId: number;
  user_id: string | null;
  session_id: string;
  reason: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  description: string | null;
}

export type FlaggedStatement = Selectable<FlaggedStatementTable>;
export type NewFlaggedStatement = Insertable<FlaggedStatementTable>;
export type FlaggedStatementUpdate = Updateable<FlaggedStatementTable>;

export interface ResponsesTable {
  id: Generated<number>;
  user_id: string | null;
  statementId: number;
  session_id: string;
  choice: "agree" | "disagree" | "itsComplicated" | "skip";
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Response = Selectable<ResponsesTable>;
export type NewResponse = Insertable<ResponsesTable>;
export type ResponseUpdate = Updateable<ResponsesTable>;

export interface AuthorTable {
  id: Generated<number>;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export type Author = Selectable<AuthorTable>;
export type NewAuthor = Insertable<AuthorTable>;
export type AuthorUpdate = Updateable<AuthorTable>;
