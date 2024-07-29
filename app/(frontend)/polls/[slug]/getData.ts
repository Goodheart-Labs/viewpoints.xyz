import { notFound } from "next/navigation";
import type { UserResponseItem } from "@/app/components/polls/responses/UserResponses";
import { db } from "@/db/client";
import type {
  Author,
  Statement,
  FlaggedStatement,
  Poll,
  Response,
  StatementOption,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getVisitorId } from "@/lib/getVisitorId";

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;

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
  const visitorId = getVisitorId();

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

  const flaggedStatements = (
    await db
      .selectFrom("flagged_statements")
      .selectAll()
      .where(
        "flagged_statements.statementId",
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
      .selectFrom("authors")
      .selectAll()
      .where(
        "authors.userId",
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

  // TODO: Make sure we're using the visitor id as needed
  const [filteredStatements, userResponses] = filterStatements(
    statementsWithStuff,
    userId,
    visitorId,
  );

  return {
    poll,
    statements: statementsWithStuff,
    filteredStatements,
    statementOptions,
    userResponses,
  };
};

type FilteredStatement = Statement & {
  author: Author | null;
};

export function filterStatements(
  statements: PollWithStatements["statements"],
  userId: string | null,
  /**
   * The session id or visitor id of the user.
   */
  sessionId: string,
): [FilteredStatement[], Record<number, UserResponseItem>] {
  const filteredStatements: FilteredStatement[] = [];
  const userResponses: Record<number, UserResponseItem> = {};

  for (const statement of statements) {
    if (!statement.visible) continue;

    if (
      (statement.flaggedStatements ?? []).length > MAX_NUM_FLAGS_BEFORE_REMOVAL
    ) {
      continue;
    }

    const responseCountMap = new Map<Response["choice"], number>([
      ["agree", 0],
      ["disagree", 0],
      ["skip", 0],
    ]);

    let userResponse: Omit<UserResponseItem, "percentage"> | null = null;

    for (const response of statement.responses) {
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

    const didUserFlag = statement.flaggedStatements.some(
      (flag) =>
        (userId && flag.user_id === userId) || flag.session_id === sessionId,
    );

    if (didUserFlag) {
      continue;
    }

    if (userResponse) {
      const totalResponses = Array.from(responseCountMap.values()).reduce(
        (acc, curr) => acc + curr,
        0,
      );

      userResponses[userResponse.statementId] = {
        ...userResponse,
        percentage: Math.round(
          (responseCountMap.get(userResponse.choice)! / totalResponses) * 100,
        ),
      };

      continue;
    }

    filteredStatements.push(statement);
  }

  return [filteredStatements, userResponses];
}
