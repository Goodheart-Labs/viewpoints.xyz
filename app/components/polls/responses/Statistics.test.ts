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

  it("returns null when all responses are 'skip' or 'itsComplicated'", () => {
    const statements: StatementWithStats[] = [
      {
        ...defaultStatementAttributes,
        id: 1,
        text: "Statement 1",
        user_id: "1",
        session_id: "abc123",
        stats: {
          votePercentages: new Map([["skip", 1]]),
          mostCommonChoice: "skip",
          consensus: 0,
          conflict: 0,
        },
      },
      {
        ...defaultStatementAttributes,
        id: 2,
        text: "Statement 2",
        user_id: "1",
        session_id: "abc123",
        stats: {
          votePercentages: new Map([["itsComplicated", 1]]),
          mostCommonChoice: "itsComplicated",
          consensus: 0,
          conflict: 0,
        },
      },
    ];

    const responseOne: UserResponseItem = {
      id: 1,
      statementId: 1,
      user_id: "1",
      session_id: "abc123",
      option_id: undefined,
      choice: "skip",
      statementText: "Statement 1",
      percentage: 0,
      created_at: new Date(),
    };

    const responseTwo: UserResponseItem = {
      id: 2,
      statementId: 2,
      user_id: "1",
      session_id: "abc123",
      option_id: undefined,
      choice: "itsComplicated",
      statementText: "Statement 2",
      percentage: 0,
      created_at: new Date(),
    };

    const userResponses = new Map([
      [1, responseOne],
      [2, responseTwo],
    ]);

    const result = getHighlightedStatements(statements, userResponses);

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
        stats: {
          votePercentages: new Map([["agree", 0.9]]),
          mostCommonChoice: "agree",
          consensus: 90,
          conflict: 10,
        },
      },
      {
        ...defaultStatementAttributes,
        id: 2,
        text: "Statement 2",
        user_id: "2",
        session_id: "def456",
        stats: {
          votePercentages: new Map([["disagree", 0.3]]),
          mostCommonChoice: "disagree",
          consensus: 30,
          conflict: 70,
        },
      },
    ];

    const responseOne: UserResponseItem = {
      id: 1,
      statementId: 1,
      user_id: "1",
      session_id: "abc123",
      option_id: undefined,
      choice: "agree",
      statementText: "Statement 1",
      percentage: 100,
      created_at: new Date(),
    };

    const responseTwo: UserResponseItem = {
      id: 2,
      statementId: 1,
      user_id: "2",
      session_id: "def456",
      option_id: undefined,
      choice: "agree",
      statementText: "Statement 1",
      percentage: 100,
      created_at: new Date(),
    };

    const responseThree: UserResponseItem = {
      id: 3,
      statementId: 2,
      user_id: "3",
      session_id: "ghi789",
      option_id: undefined,
      choice: "agree",
      statementText: "Statement 2",
      percentage: 50,
      created_at: new Date(),
    };

    const responseFour: UserResponseItem = {
      id: 4,
      statementId: 2,
      user_id: "4",
      session_id: "jkl012",
      option_id: undefined,
      choice: "disagree",
      statementText: "Statement 2",
      percentage: 50,
      created_at: new Date(),
    };

    const userResponses = new Map([
      [1, responseOne],
      [1, responseTwo],
      [2, responseThree],
      [2, responseFour],
    ]);

    const result = getHighlightedStatements(statements, userResponses);

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
        stats: {
          votePercentages: new Map([["agree", 1]]),
          mostCommonChoice: "agree",
          consensus: 100,
          conflict: 0,
        },
      },
    ];

    const singleResponse: UserResponseItem = {
      id: 1,
      statementId: 1,
      user_id: "1",
      session_id: "xyz123",
      option_id: undefined,
      choice: "agree",
      statementText: "Single Statement",
      percentage: 100,
      created_at: new Date(),
    };

    const userResponses = new Map([[1, singleResponse]]);

    const result = getHighlightedStatements(statements, userResponses);

    expect(result.mostConsensus).toEqual({
      statement: statements[0],
      choice: singleResponse.choice, // "agree"
    });
    expect(result.mostControversial).toEqual({
      statement: statements[0],
      choice: singleResponse.choice, // "agree"
    });
  });
});
