import { db } from "@/db/client";
import type { StatementOption } from "@/db/schema";
import type { SortKey } from "./constants";
import { sortOptions } from "./constants";
import { getStatementStatistics } from "./statements";

export const getPollResults = async (slug: string, sortBy?: SortKey) => {
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirstOrThrow();

  const statements = await db
    .selectFrom("statements")
    .selectAll()
    .where("poll_id", "=", poll.id)
    .execute();

  const statementOptions = (
    await db
      .selectFrom("statement_options")
      .selectAll()
      .where(
        "statement_options.statement_id",
        "in",
        statements.map((s) => s.id),
      )
      .execute()
  ).reduce(
    (acc, curr) => {
      acc[curr.statement_id] = acc[curr.statement_id] || [];
      acc[curr.statement_id].push(curr);
      return acc;
    },
    {} as Record<number, StatementOption[]>,
  );

  const responses = await db
    .selectFrom("responses")
    .selectAll()
    .where(
      "responses.statementId",
      "in",
      statements.map((s) => s.id),
    )
    .execute();

  const statementsWithResponses = statements.map((statement) => ({
    ...statement,
    responses: responses.filter(
      (response) => response.statementId === statement.id,
    ),
  }));

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

  const sortOption =
    sortOptions.find((o) => o.key === sortBy) ?? sortOptions[0];

  statementsWithStats.sort(sortOption.sortFn);

  return {
    poll,
    statements: statementsWithStats,
    statementOptions,
    responseCount,
    respondentsCount: totalUserSessions.size,
  };
};
