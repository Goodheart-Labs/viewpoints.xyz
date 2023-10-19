import prisma from "@/lib/prisma";

import type { SortKey } from "./constants";
import { sortOptions } from "./constants";
import { getStatementStatistics } from "./statements";

export const getPollResults = async (slug: string, sortBy?: SortKey) => {
  const poll = await prisma.polls.findUniqueOrThrow({
    where: {
      slug,
    },
    select: {
      _count: {
        select: {
          comments: true,
        },
      },
      title: true,
      core_question: true,
      id: true,
      slug: true,
    },
  });

  const statements = await prisma.statement.findMany({
    where: {
      poll_id: poll.id,
    },
    include: {
      responses: true,
    },
  });

  let responseCount = 0;
  const totalUserSessions = new Set<string>();

  const statementsWithStats = statements.map((statement) => {
    const stats = getStatementStatistics(statement);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { responses, ...statementData } = statement;

    responseCount += statement.responses.length;

    statement.responses.forEach((response) => {
      if (response.user_id) {
        totalUserSessions.add(response.user_id);
      } else {
        totalUserSessions.add(response.session_id);
      }
    });

    return {
      ...statementData,
      stats,
    };
  });

  const sortOption =
    sortOptions.find((o) => o.key === sortBy) ?? sortOptions[0];

  statementsWithStats.sort(sortOption.sortFn);

  return {
    poll,
    statements: statementsWithStats,
    commentCount: poll._count.comments,
    responseCount,
    respondentsCount: totalUserSessions.size,
  };
};
