import type {
  choice_enum,
  polls,
  reporting_type_enum,
  responses,
  Statement as StatementType,
} from "@prisma/client";

import type { Correlation } from "./analytics/statements";

export type Poll = polls;

export type Statement = StatementType;

export type StatementReportingType = reporting_type_enum;

export type Choice = choice_enum;

export type Response = responses;

export type AnalyticsFilters = {
  correlatedStatements: Correlation["key"][];
};
