import type {
  Author,
  choice_enum,
  polls,
  responses,
  Statement,
} from "@prisma/client";

export type Poll = polls;

export type Choice = choice_enum;

export type Response = responses;

export type CreateStatementBody = Pick<Statement, "text">;

export type StatementWithAuthor = Statement & {
  author: Author | null;
};
