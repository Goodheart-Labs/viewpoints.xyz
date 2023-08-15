import type {
  choice_enum,
  polls,
  reporting_type_enum,
  responses,
} from "@prisma/client";

export type Poll = polls;

export type StatementReportingType = reporting_type_enum;

export type Choice = choice_enum;

export type Response = responses;
