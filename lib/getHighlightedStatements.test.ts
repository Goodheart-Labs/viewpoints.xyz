import { describe, it, expect } from "bun:test";
import type { StatementWithStats } from "@/lib/pollResults/constants";
import { getHighlightedStatements } from "./getHighlightedStatements";
import type { UserResponseItem } from "../app/components/polls/responses/UserResponses";

type Statement = StatementWithStats;

describe("getHighlightedStatements", () => {
  it("returns null for empty inputs", () => {
    const statements: Statement[] = [];
    const userResponses: Record<number, UserResponseItem> = {};
    const result = getHighlightedStatements(statements, userResponses);
    expect(result.mostConsensus).toBeNull();
    expect(result.mostControversial).toBeNull();
  });

  const defaultStatementAttributes = {
    poll_id: 1,
    question_type: "default" as const,
    answer_type: "default" as const,
    created_at: new Date(),
  };

  const defaultResponseAttributes = {
    user_id: "1",
    session_id: "abc123",
    option_id: 0,
    created_at: new Date(),
    id: 1,
    statementId: 1,
  };

  it("returns null when all responses are 'skip' or 'itsComplicated'", () => {
    const statements: Statement[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: { skip: 1 },
          mostCommonChoice: "skip",
          consensus: 0,
          conflict: 0,
          voteCounts: { skip: 1 },
        },
      },
      {
        ...defaultStatementAttributes,
        id: 2,
        text: "Statement 2",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: { skip: 1 },
          mostCommonChoice: "skip",
          consensus: 0,
          conflict: 0,
          voteCounts: { skip: 1 },
        },
      },
    ];

    const userResponses: Record<number, UserResponseItem> = {
      1: {
        ...defaultResponseAttributes,
        id: 1,
        statementId: 1,
        choice: "skip",
        statementText: "Statement 1",
        percentage: 0,
      },
      2: {
        ...defaultResponseAttributes,
        id: 2,
        statementId: 2,
        choice: "skip",
        statementText: "Statement 2",
        percentage: 0,
      },
    };

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount: 0,
    });

    expect(result.mostConsensus).toBeNull();
    expect(result.mostControversial).toBeNull();
  });

  it("returns correct mostConsensus and mostControversial for normal inputs", () => {
    const statements: Statement[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 2,
          votePercentages: { agree: 1 },
          mostCommonChoice: "agree",
          consensus: 90,
          conflict: 10,
          voteCounts: { agree: 2 },
        },
      },
      {
        ...defaultStatementAttributes,
        id: 2,
        text: "Statement 2",
        user_id: "2",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 2,
          votePercentages: { disagree: 0, agree: 1 },
          mostCommonChoice: "agree",
          consensus: 100,
          conflict: 0,
          voteCounts: { disagree: 0, agree: 2 },
        },
      },
    ];

    const userResponses: Record<number, UserResponseItem> = {
      1: {
        ...defaultResponseAttributes,
        id: 1,
        statementId: 1,
        choice: "agree",
        statementText: "Statement 1",
        percentage: 100,
      },
      2: {
        ...defaultResponseAttributes,
        id: 0,
        statementId: 2,
        choice: "disagree",
        statementText: "Statement 1",
        percentage: 0,
      },
    };

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount: 0,
    });

    expect(result.mostConsensus).toEqual({
      statement: statements[0],
      choice: "agree",
    });
    expect(result.mostControversial).toEqual({
      statement: statements[1],
      choice: "disagree",
    });
  });

  it("returns the same statement for mostConsensus and mostControversial when there is only one statement with a clear response", () => {
    const statements: Statement[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Single Statement",
        user_id: "1",
        session_id: "xyz123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: { agree: 1 },
          mostCommonChoice: "agree",
          consensus: 100,
          conflict: 0,
          voteCounts: { agree: 1 },
        },
      },
    ];

    const userResponses: Record<number, UserResponseItem> = {
      1: {
        ...defaultResponseAttributes,
        id: 1,
        statementId: 1,
        choice: "agree",
        statementText: "Single Statement",
        percentage: 100,
      },
    };

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount: 0,
    });

    expect(result.mostConsensus).toEqual({
      statement: statements[0],
      choice: "agree",
    });
    expect(result.mostControversial).toEqual({
      statement: statements[0],
      choice: "agree",
    });
  });

  it("only considers statements with response count above the minimum threshold", () => {
    const minimumResponseCount = 2;

    const statements: Statement[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: { agree: 0.8 },
          mostCommonChoice: "agree",
          consensus: 80,
          conflict: 20,
          voteCounts: { agree: 1 },
        },
      },
      {
        ...defaultStatementAttributes,
        id: 2,
        text: "Statement 2",
        user_id: "2",
        session_id: "def456",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: { disagree: 0.5 },
          mostCommonChoice: "disagree",
          consensus: 50,
          conflict: 50,
          voteCounts: { disagree: 1 },
        },
      },
    ];

    const userResponses: Record<number, UserResponseItem> = {
      1: {
        ...defaultResponseAttributes,
        id: 1,
        statementId: 1,
        choice: "agree",
        statementText: "Statement 1",
        percentage: 50,
      },
      2: {
        ...defaultResponseAttributes,
        id: 2,
        statementId: 2,
        choice: "disagree",
        statementText: "Statement 2",
        percentage: 100,
      },
    };

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount,
    });

    expect(result.mostConsensus).toBeNull();
    expect(result.mostControversial).toBeNull();

    // statements[0].responses.push({
    //   ...defaultResponseAttributes,
    //   choice: "agree",
    // });
    // statements[1].responses.push({
    //   ...defaultResponseAttributes,
    //   choice: "disagree",
    // });
    statements[0].stats.responseCount = 2;
    statements[1].stats.responseCount = 2;

    const resultWithMinimumResponses = getHighlightedStatements(
      statements,
      userResponses,
      {
        minimumResponseCount: 2,
      },
    );

    expect(resultWithMinimumResponses.mostConsensus).toEqual({
      statement: statements[1],
      choice: "disagree",
    });
    expect(resultWithMinimumResponses.mostControversial).toEqual({
      statement: statements[0],
      choice: "agree",
    });
  });
});
