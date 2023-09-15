import type {
  Author,
  choice_enum,
  Comment,
  polls,
  responses,
  Statement,
} from "@prisma/client";

import type { Correlation } from "./analytics/comments";

export type Poll = polls;

export type Choice = choice_enum;

export type Response = responses;

export type CreateStatementBody = Pick<Statement, "text">;

export type StatementWithAuthor = Statement & {
  author: Author | null;
};

export type CommentWithAuthor = Comment & {
  author: Author | null;
};

export type AnalyticsFilters = {
  correlatedComments: Correlation["key"][];
};
