import { describe, expect, it } from "vitest";

import type { AllResponses, UserResponses } from "./responses";
import {
  calculateResponsePercentages,
  getUserConsensusViews,
} from "./responses";

describe("calculateResponsePercentages", () => {
  it("works correctly", () => {
    const allResponses: AllResponses = [
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const userResponses: UserResponses = [
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const result = calculateResponsePercentages(allResponses, userResponses);

    expect(result.get(1)).toBe(100); // 100% agreement for statement 1
    expect(result.get(2)).toBe(66.66666666666666); // 66.7% agreement for statement 2
  });

  it("ignores skips", () => {
    const allResponses: AllResponses = [
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "bcd",
      },
      {
        statementId: 1,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "cde",
      },
      {
        statementId: 1,
        choice: "skip",
        created_at: new Date(),
        user_id: null,
        session_id: "def",
      },
    ];

    const userResponses: UserResponses = [
      {
        statementId: 1,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "cde",
      },
    ];

    const result = calculateResponsePercentages(allResponses, userResponses);

    expect(result.get(1)).toBe(33.33333333333333); // 33.3% agreement for statement 1, 2/3 agree, 1/3 disagree, one skip
  });
});

describe("getUserConsensusViews", () => {
  it("getUserConsensusViews works correctly", () => {
    const allResponses: AllResponses = [
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 3,
        choice: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 3,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const userResponses: UserResponses = [
      {
        statementId: 1,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        statementId: 2,
        choice: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const result = getUserConsensusViews(allResponses, userResponses);

    // Statement 1 has 100% agree consensus

    expect(result.mostConsensus?.statementId).toBe(1);
    expect(result.mostConsensus?.choice).toBe("agree");
    expect(result.mostConsensus?.consensusPercentage).toBe(100);

    // 3/4 users disagree with statement 2. Our user is in the minority.

    expect(result.mostControversial?.statementId).toBe(2);
    expect(result.mostControversial?.choice).toBe("agree");
    expect(result.mostControversial?.consensusPercentage).toBe(25);
  });
});
