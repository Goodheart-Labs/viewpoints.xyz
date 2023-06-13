import { describe, it, expect } from "vitest";
import {
  calculateResponsePercentages,
  getUserConsensusViews,
  AllResponses,
  UserResponses,
} from "./responses";

type MinimalResponse = {
  comment_id: number;
  valence: string;
  created_at: Date;
  user_id: string | null;
  session_id: string;
};

describe("calculateResponsePercentages", () => {
  it("works correctly", () => {
    const allResponses: AllResponses = [
      {
        comment_id: 1,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 1,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const userResponses: UserResponses = [
      {
        comment_id: 1,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const result = calculateResponsePercentages(allResponses, userResponses);

    expect(result[1]).toBe(100); // 100% agreement for comment 1
    expect(result[2]).toBe(66.66666666666666); // 66.7% agreement for comment 2
  });
});

describe("getUserConsensusViews", () => {
  it("getUserConsensusViews works correctly", () => {
    const allResponses: AllResponses = [
      {
        comment_id: 1,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 1,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 3,
        valence: "negative",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 3,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const userResponses: UserResponses = [
      {
        comment_id: 1,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
      {
        comment_id: 2,
        valence: "positive",
        created_at: new Date(),
        user_id: null,
        session_id: "abc",
      },
    ];

    const result = getUserConsensusViews(allResponses, userResponses);

    // Comment 1 has 100% positive consensus

    expect(result.mostConsensus?.comment_id).toBe(1);
    expect(result.mostConsensus?.valence).toBe("positive");
    expect(result.mostConsensus?.consensusPercentage).toBe(100);

    // 3/4 users disagree with comment 2. Our user is in the minority.

    expect(result.mostControversial?.comment_id).toBe(2);
    expect(result.mostControversial?.valence).toBe("positive");
    expect(result.mostControversial?.consensusPercentage).toBe(25);
  });
});
