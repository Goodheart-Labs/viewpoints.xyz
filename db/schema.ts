import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  authors: AuthorsTable;
  polls: PollsTable;
  statements: StatementsTable;
  statement_options: StatementOptionsTable;
  flagged_statements: FlaggedStatementsTable;
  responses: ResponsesTable;
  sessions: SessionsTable;
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

export interface StatementsTable {
  id: Generated<number>;
  poll_id: number;
  question_type?: "default" | "demographic";
  answer_type?: "default" | "custom_options";
  user_id: string | null;
  session_id: string;
  text: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Statement = Selectable<StatementsTable>;
export type NewStatement = Insertable<StatementsTable>;
export type StatementUpdate = Updateable<StatementsTable>;

export interface StatementOptionsTable {
  id: Generated<number>;
  statement_id: number;
  option: string;
  icon: string | null;
}

export type StatementOption = Selectable<StatementOptionsTable>;
export type NewStatementOption = Insertable<StatementOptionsTable>;
export type StatementOptionUpdate = Updateable<StatementOptionsTable>;

export interface FlaggedStatementsTable {
  id: Generated<number>;
  statementId: number;
  user_id: string | null;
  session_id: string;
  reason: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  description: string | null;
}

export type FlaggedStatement = Selectable<FlaggedStatementsTable>;
export type NewFlaggedStatement = Insertable<FlaggedStatementsTable>;
export type FlaggedStatementUpdate = Updateable<FlaggedStatementsTable>;

type ResponsesTable = {
  id: Generated<number>;
  user_id: string | null;
  statementId: number;
  session_id: string;
  choice?: string;
  option_id?: number;
  created_at: ColumnType<Date, string | undefined, never>;
};

export type Response = Selectable<ResponsesTable>;
export type NewResponse = Insertable<ResponsesTable>;
export type ResponseUpdate = Updateable<ResponsesTable>;

export interface AuthorsTable {
  id: Generated<number>;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export type Author = Selectable<AuthorsTable>;
export type NewAuthor = Insertable<AuthorsTable>;
export type AuthorUpdate = Updateable<AuthorsTable>;

export interface SessionsTable {
  id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;
