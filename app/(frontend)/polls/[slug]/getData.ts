import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import type { UserResponseItem } from "@/app/components/polls/responses/UserResponses";
import type { Choice, StatementWithAuthor } from "@/lib/api";
import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;
const MAX_NUM_SKIPS_BEFORE_REMOVAL = 5;

export const getData = async (slug: string) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  const poll = await prisma.polls.findFirst({
    where: {
      slug,
    },
    include: {
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      statements: {
        orderBy: {
          id: "desc",
        },
        include: {
          author: true,
          flaggedStatements: true,
          responses: true,
        },
      },
    },
  });

  if (!poll) {
    notFound();
  }

  const filteredStatements: StatementWithAuthor[] = [];
  const userResponses = new Map<number, UserResponseItem>();

  for (const statement of poll.statements) {
    if (statement.flaggedStatements.length > MAX_NUM_FLAGS_BEFORE_REMOVAL) {
      continue;
    }

    let skipCount = 0;
    const responseCountMap = new Map<Choice, number>([
      ["agree", 0],
      ["disagree", 0],
      ["skip", 0],
      ["itsComplicated", 0],
    ]);
    let userResponse: Omit<UserResponseItem, "percentage"> | null = null;

    for (const response of statement.responses) {
      if (response.choice === "skip") {
        skipCount += 1;
      }

      if (
        (userId && response.user_id === userId) ||
        response.session_id === sessionId
      ) {
        userResponse = {
          ...response,
          statementText: statement.text,
        };
      }

      responseCountMap.set(
        response.choice,
        responseCountMap.get(response.choice)! + 1,
      );
    }

    if (skipCount > MAX_NUM_SKIPS_BEFORE_REMOVAL) {
      continue;
    }

    const didUserFlag = statement.flaggedStatements.some(
      (flag) => flag.user_id === userId || flag.session_id === sessionId,
    );

    if (didUserFlag) {
      continue;
    }

    if (userResponse) {
      const totalResponses = Array.from(responseCountMap.values()).reduce(
        (acc, curr) => acc + curr,
        0,
      );

      userResponses.set(userResponse.statementId, {
        ...userResponse,
        percentage: Math.round(
          (responseCountMap.get(userResponse.choice)! / totalResponses) * 100,
        ),
      });

      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { responses, flaggedStatements, ...filteredStatementData } =
      statement;

    filteredStatements.push(filteredStatementData);
  }

  const sortedFilteredStatements = filteredStatements.sort(
    () => 0.5 - Math.random(),
  );

  return { poll, filteredStatements: sortedFilteredStatements, userResponses };
};
