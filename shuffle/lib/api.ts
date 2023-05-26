import { comments, flagged_comments, polls, responses } from "@prisma/client";

export type Poll = polls;

export type CommentReportingType = "default" | "demographic";

export type Comment = comments;

export type FlaggedComment = flagged_comments;

export type Valence = "agree" | "disagree" | "skip" | "itsComplicated";

export type Response = responses;
