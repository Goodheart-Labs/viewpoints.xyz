import { describe, it, expect } from "bun:test";
import type { StatementWithStats } from "@/lib/pollResults/constants";
import { getHighlightedStatements } from "./Statistics";
import type { UserResponseItem } from "./UserResponses";

describe("getHighlightedStatements", () => {
  it("returns null for empty inputs", () => {
    const statements: StatementWithStats[] = [];
    const userResponses = new Map();
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
  };

  it("returns null when all responses are 'skip' or 'itsComplicated'", () => {
    const statements: StatementWithStats[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: new Map([["skip", 1]]),
          mostCommonChoice: "skip",
          consensus: 0,
          conflict: 0,
          voteCounts: new Map([["skip", 1]]),
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
          votePercentages: new Map([["skip", 1]]),
          mostCommonChoice: "skip",
          consensus: 0,
          conflict: 0,
          voteCounts: new Map([["skip", 1]]),
        },
      },
    ];

    const responseOne: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 1,
      statementId: 1,
      choice: "skip",
      statementText: "Statement 1",
      percentage: 0,
    };

    const responseTwo: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 2,
      statementId: 2,
      choice: "skip",
      statementText: "Statement 2",
      percentage: 0,
    };

    const userResponses = new Map([
      [1, responseOne],
      [2, responseTwo],
    ]);

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount: 0,
    });

    expect(result.mostConsensus).toBeNull();
    expect(result.mostControversial).toBeNull();
  });

  it("returns correct mostConsensus and mostControversial for normal inputs", () => {
    const statements: StatementWithStats[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 2,
          votePercentages: new Map([["agree", 0.9]]),
          mostCommonChoice: "agree",
          consensus: 90,
          conflict: 10,
          voteCounts: new Map([["agree", 2]]),
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
          responseCount: 2,
          votePercentages: new Map([["disagree", 0.3]]),
          mostCommonChoice: "disagree",
          consensus: 30,
          conflict: 70,
          voteCounts: new Map([["disagree", 2]]),
        },
      },
    ];

    const responseOne: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 1,
      statementId: 1,
      choice: "agree",
      statementText: "Statement 1",
      percentage: 100,
    };

    const responseTwo: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 2,
      statementId: 1,
      choice: "agree",
      statementText: "Statement 1",
      percentage: 100,
    };

    const responseThree: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 3,
      statementId: 2,
      choice: "agree",
      statementText: "Statement 2",
      percentage: 50,
    };

    const responseFour: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 4,
      statementId: 2,
      choice: "disagree",
      statementText: "Statement 2",
      percentage: 50,
    };

    const userResponses = new Map([
      [1, responseOne],
      [1, responseTwo],
      [2, responseThree],
      [2, responseFour],
    ]);

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount: 0,
    });

    expect(result.mostConsensus).toEqual({
      statement: statements[0],
      choice: responseOne.choice, // agree
    });
    expect(result.mostControversial).toEqual({
      statement: statements[1],
      choice: responseFour.choice, // disagree - TODO: this could easily be agree, depending on the order of the responses
    });
  });

  it("returns the same statement for mostConsensus and mostControversial when there is only one statement with a clear response", () => {
    const statements: StatementWithStats[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Single Statement",
        user_id: "1",
        session_id: "xyz123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: new Map([["agree", 1]]),
          mostCommonChoice: "agree",
          consensus: 100,
          conflict: 0,
          voteCounts: new Map([["agree", 1]]),
        },
      },
    ];

    const singleResponse: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 1,
      statementId: 1,
      choice: "agree",
      statementText: "Single Statement",
      percentage: 100,
    };

    const userResponses = new Map([[1, singleResponse]]);

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount: 0,
    });

    expect(result.mostConsensus).toEqual({
      statement: statements[0],
      choice: singleResponse.choice, // "agree"
    });
    expect(result.mostControversial).toEqual({
      statement: statements[0],
      choice: singleResponse.choice, // "agree"
    });
  });

  it("only considers statements with response count above the minimum threshold", () => {
    const minimumResponseCount = 2;

    const statements: StatementWithStats[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        visible: true,
        stats: {
          responseCount: 1,
          votePercentages: new Map([["agree", 0.8]]),
          mostCommonChoice: "agree",
          consensus: 80,
          conflict: 20,
          voteCounts: new Map([["agree", 1]]),
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
          votePercentages: new Map([["disagree", 0.5]]),
          mostCommonChoice: "disagree",
          consensus: 50,
          conflict: 50,
          voteCounts: new Map([["disagree", 1]]),
        },
      },
    ];

    const responseOne: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 1,
      statementId: 1,
      choice: "agree",
      statementText: "Statement 1",
      percentage: 50,
    };

    const responseTwo: UserResponseItem = {
      ...defaultResponseAttributes,
      id: 2,
      statementId: 2,
      choice: "disagree",
      statementText: "Statement 2",
      percentage: 100,
    };

    const userResponses = new Map([
      [1, responseOne], // Only one response for Statement 1
      [2, responseTwo], // Only one response for Statement 2
    ]);

    const result = getHighlightedStatements(statements, userResponses, {
      minimumResponseCount,
    });

    // Since neither statement meets the minimumResponseCount, both should be null
    expect(result.mostConsensus).toBeNull();
    expect(result.mostControversial).toBeNull();

    // Now reduce the minimumResponseCount to 1

    const resultWithLowerMinimumResponse = getHighlightedStatements(
      statements,
      userResponses,
      {
        minimumResponseCount: 1,
      },
    );

    expect(resultWithLowerMinimumResponse.mostConsensus).toEqual({
      statement: statements[1],
      choice: responseTwo.choice, // agree
    });
    expect(resultWithLowerMinimumResponse.mostControversial).toEqual({
      statement: statements[0],
      choice: responseOne.choice, // agree
    });

    // Also check that the minimumResponseCount actually works by upping the count to 2

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
      choice: responseTwo.choice, // agree
    });
    expect(resultWithMinimumResponses.mostControversial).toEqual({
      statement: statements[0],
      choice: responseOne.choice, // agree
    });
  });
});
