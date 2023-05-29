import { comments, flagged_comments, polls, responses } from "@prisma/client";
import { Correlation } from "./analytics/comments";

export type Poll = polls;

export type CommentReportingType = "default" | "demographic";

export type Comment = comments;

export type FlaggedComment = flagged_comments;

export type Valence = "agree" | "disagree" | "skip" | "itsComplicated";

export type Response = responses;

export type AnalyticsFilters = {
  correlatedComments: Correlation["key"][];
};
