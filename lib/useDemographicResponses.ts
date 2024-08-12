import type { StatementOption, Response } from "@/db/schema";
import { useMemo } from "react";
import type { StatementWithStats } from "./pollResults/constants";

type StatementWithStatsAndResponses = StatementWithStats & {
  responses: Response[];
};

export const useDemographicResponses = (
  statements: StatementWithStatsAndResponses[],
  statementOptions: Record<number, StatementOption[]>,
  enabledDemographicFilters: Record<number, number[]>,
) => {
  // Pull out all demographic statements and responses

  const demographicStatements = useMemo(
    () =>
      statements.filter(({ question_type }) => question_type === "demographic"),
    [statements],
  );

  const allDemographicResponses = useMemo(
    () => demographicStatements.flatMap((statement) => statement.responses),
    [demographicStatements],
  );

  // Group responses of demographic questions by session_id

  const demographicResponsesBySessionId = useMemo(
    () =>
      allDemographicResponses.reduce(
        (acc, response) => {
          if (!acc[response.session_id]) {
            acc[response.session_id] = [];
          }
          acc[response.session_id].push(response);
          return acc;
        },
        {} as Record<string, Response[]>,
      ),
    [allDemographicResponses],
  );

  // Let's get a list of sessionIds for each demographic option

  const sessionIdsByDemographicOptionId = useMemo(
    () =>
      demographicStatements.reduce(
        (acc, statement) =>
          statementOptions[statement.id].reduce((optionCounts, option) => {
            const sessionIds = allDemographicResponses
              .filter((response) => response.option_id === option.id)
              .map((response) => response.session_id);

            return {
              ...optionCounts,
              [option.id]: sessionIds,
            };
          }, acc),
        {} as Record<number, string[]>,
      ),
    [allDemographicResponses, demographicStatements, statementOptions],
  );

  // Get a count of how many sessions there are in each demographic group.
  //
  // For instance:
  // If the user selects Age = <18, then we should update the counts such that the
  // counts for other demographics are only for sessions that have Age = <18 (and
  // set the count for Age = >=18 to 0).
  //
  // If no filters are set, then we should return the total number of sessions for
  // each demographic group.
  //
  // Map this to a record of demographic option id -> count

  const totalSessionCountsByDemographicOptionId = useMemo(
    () =>
      demographicStatements.reduce(
        (acc, statement) =>
          statementOptions[statement.id].reduce((countsAcc, option) => {
            const sessionIds = sessionIdsByDemographicOptionId[option.id] ?? 0;

            return {
              ...countsAcc,
              [option.id]:
                Object.keys(enabledDemographicFilters).length > 0
                  ? sessionIds.filter((sessionId) =>
                      demographicResponsesBySessionId[sessionId].every(
                        (response) =>
                          response.option_id &&
                          (enabledDemographicFilters[response.statementId]
                            ?.length ?? 0) > 0
                            ? enabledDemographicFilters[
                                response.statementId
                              ]?.includes(response.option_id)
                            : true,
                      ),
                    ).length
                  : sessionIds.length,
            };
          }, acc),
        {} as Record<number, number>,
      ),
    [
      demographicResponsesBySessionId,
      demographicStatements,
      enabledDemographicFilters,
      sessionIdsByDemographicOptionId,
      statementOptions,
    ],
  );

  const response = useMemo(
    () => ({
      demographicStatements,
      demographicResponsesBySessionId,
      sessionIdsByDemographicOptionId,
      totalSessionCountsByDemographicOptionId,
    }),
    [
      demographicStatements,
      demographicResponsesBySessionId,
      sessionIdsByDemographicOptionId,
      totalSessionCountsByDemographicOptionId,
    ],
  );

  return response;
};
