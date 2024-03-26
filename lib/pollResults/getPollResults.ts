import { db } from "@/db/client";
import type { StatementOption } from "@/db/schema";
import { notFound } from "next/navigation";
import type { SortKey } from "./constants";
import { sortOptions } from "./constants";
import { getStatementsWithStats } from "./getStatementsWithStats";

export const getPollResults = async (slug: string, sortBy?: SortKey) => {
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (!poll) {
    notFound();
  }

  const statements = await db
    .selectFrom("statements")
    .selectAll()
    .where("poll_id", "=", poll.id)
    // and where statement is visible
    .where("visible", "=", true)
    .orderBy("id asc")
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

  const [statementsWithStats, responseCount, respondentsCount] =
    getStatementsWithStats(statementsWithResponses);

  const sortOption =
    sortOptions.find((o) => o.key === sortBy) ?? sortOptions[0];

  statementsWithStats.sort(sortOption.sortFn);

  return {
    poll,
    statements: statementsWithStats,
    statementOptions,
    responseCount,
    respondentsCount,
  };
};
