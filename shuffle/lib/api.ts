import type {
  choice_enum,
  comments,
  flagged_comments,
  polls,
  reporting_type_enum,
  responses,
} from "@prisma/client";

export type Poll = polls;

export type CommentReportingType = reporting_type_enum;

export type Comment = comments;

export type FlaggedComment = flagged_comments;

export type Choice = choice_enum;

export type Response = responses;
