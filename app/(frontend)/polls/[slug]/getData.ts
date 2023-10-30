import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import type { UserResponseItem } from "@/app/components/polls/responses/UserResponses";
import type { Choice, StatementWithAuthor } from "@/lib/api";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { db } from "@/db/client";
import type {
  Author,
  Statement,
  FlaggedStatement,
  Poll,
  Response,
} from "@/db/schema";

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;
const MAX_NUM_SKIPS_BEFORE_REMOVAL = 5;

export type PollWithStatements = Poll & {
  statements: (Statement & {
    author: Author | null;
    flaggedStatements: FlaggedStatement[];
    responses: (Response & {
      author: Author | null;
    })[];
  })[];
};

export const getData = async (slug: string) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  // Pull the poll and associated data from the database

  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (!poll) {
    notFound();
  }

  const statements = await db
    .selectFrom("Statement")
    .selectAll()
    .where("poll_id", "=", poll.id)
    .execute();

  const flaggedStatements = (
    await db
      .selectFrom("FlaggedStatement")
      .selectAll()
      .where(
        "FlaggedStatement.statementId",
        "in",
        statements.map((s) => s.id),
      )
      .execute()
  ).reduce(
    (acc, curr) => {
      acc[curr.statementId] = acc[curr.statementId] || [];
      acc[curr.statementId].push(curr);
      return acc;
    },
    {} as Record<number, FlaggedStatement[]>,
  );

  const responses = (
    await db
      .selectFrom("responses")
      .selectAll()
      .where(
        "responses.statementId",
        "in",
        statements.map((s) => s.id),
      )
      .execute()
  ).reduce(
    (acc, curr) => {
      acc[curr.statementId] = acc[curr.statementId] || [];
      acc[curr.statementId].push(curr);
      return acc;
    },
    {} as Record<number, Response[]>,
  );

  const authors = (
    await db
      .selectFrom("Author")
      .selectAll()
      .where(
        "Author.userId",
        "in",
        statements.map((s) => s.user_id).filter((id) => id !== null),
      )
      .execute()
  ).reduce(
    (acc, curr) => {
      acc[curr.userId] = curr;
      return acc;
    },
    {} as Record<string, Author>,
  );

  // Combine the data into an array of Poll objects

  const statementsWithStuff: PollWithStatements["statements"] = [];

  for (const statement of statements) {
    const author = authors[statement.user_id || ""];

    const responsesWithAuthors = (responses[statement.id] || []).map(
      (response) => ({
        ...response,
        author: authors[response.user_id || ""],
      }),
    );

    statementsWithStuff.push({
      ...statement,
      author,
      flaggedStatements: flaggedStatements[statement.id] || [],
      responses: responsesWithAuthors || [],
    });
  }

  // Filter out statements that have been flagged too many times or skipped too many times

  const filteredStatements: StatementWithAuthor[] = [];
  const userResponses = new Map<number, UserResponseItem>();

  for (const statement of statementsWithStuff) {
    if (
      (flaggedStatements[statement.id] ?? []).length >
      MAX_NUM_FLAGS_BEFORE_REMOVAL
    ) {
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

    filteredStatements.push(statement);
  }

  const sortedFilteredStatements = filteredStatements.sort(
    () => 0.5 - Math.random(),
  );

  return { poll, filteredStatements: sortedFilteredStatements, userResponses };
};
