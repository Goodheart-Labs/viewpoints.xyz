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
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const userResponses: UserResponses = [
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const result = calculateResponsePercentages(allResponses, userResponses);

    expect(result.get(1)).toBe(100); // 100% agreement for comment 1
    expect(result.get(2)).toBe(66.66666666666666); // 66.7% agreement for comment 2
  });

  it("ignores skips", () => {
    const allResponses: AllResponses = [
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "bcd",
      },
      {
        comment_id: 1,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "cde",
      },
      {
        comment_id: 1,
        valence: "skip",
        created_at: new Date(),
        user_id: null,
        session_id: "def",
      },
    ];

    const userResponses: UserResponses = [
      {
        comment_id: 1,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "cde",
      },
    ];

    const result = calculateResponsePercentages(allResponses, userResponses);

    expect(result.get(1)).toBe(33.33333333333333); // 33.3% agreement for comment 1, 2/3 agree, 1/3 disagree, one skip
  });
});

describe("getUserConsensusViews", () => {
  it("getUserConsensusViews works correctly", () => {
    const allResponses: AllResponses = [
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 3,
        valence: "disagree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 3,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const userResponses: UserResponses = [
      {
        comment_id: 1,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "agree",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const result = getUserConsensusViews(allResponses, userResponses);

    // Comment 1 has 100% agree consensus

    expect(result.mostConsensus?.comment_id).toBe(1);
    expect(result.mostConsensus?.valence).toBe("agree");
    expect(result.mostConsensus?.consensusPercentage).toBe(100);

    // 3/4 users disagree with comment 2. Our user is in the minority.

    expect(result.mostControversial?.comment_id).toBe(2);
    expect(result.mostControversial?.valence).toBe("agree");
    expect(result.mostControversial?.consensusPercentage).toBe(25);
  });
});
