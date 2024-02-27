import type { Statement, Response } from "@/db/schema";
import { getStatementStatistics } from "./statements";
import type { StatementWithStats } from "./constants";

export const getStatementsWithStats = (
  statementsWithResponses: (Statement & { responses: Response[] })[],
): [(StatementWithStats & { responses: Response[] })[], number, number] => {
  let responseCount = 0;
  const totalUserSessions = new Set<string>();

  const statementsWithStats = statementsWithResponses.map((statement) => {
    const stats = getStatementStatistics(statement);

    responseCount += statement.responses.length;

    statement.responses.forEach((response) => {
      if (response.user_id) {
        totalUserSessions.add(response.user_id);
      } else {
        totalUserSessions.add(response.session_id);
      }
    });

    return {
      ...statement,
      stats,
    };
  });

  return [statementsWithStats, responseCount, totalUserSessions.size];
};
